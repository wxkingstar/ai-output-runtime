#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, basename, extname, isAbsolute, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AIO_INFO_RE = /^aio:([a-z][a-z0-9-]*)@([1-9][0-9]*)(?:\.([0-9]+))?$/;
const MAX_TEXT_LENGTH = 600;
const MAX_ROWS = 100;
const MAX_COLUMNS = 12;
const MAX_METRICS = 8;
const RUNTIME_VERSION = "v0.4.1";
const DEFAULT_RUNTIME_URL = `https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@${RUNTIME_VERSION}/assets/ai-output-runtime.js`;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const BUNDLED_RUNTIME_PATH = resolve(SCRIPT_DIR, "../assets/ai-output-runtime.js");
const LANG_DIR = resolve(SCRIPT_DIR, "../assets/lang");
const LANG_MANIFEST_PATH = resolve(LANG_DIR, "index.json");
const MAX_INPUT_BYTES = 4 * 1024 * 1024;

let _langAliasMap = null;
async function loadLangAliasMap() {
  if (_langAliasMap) return _langAliasMap;
  try {
    const raw = await readFile(LANG_MANIFEST_PATH, "utf8");
    const manifest = JSON.parse(raw);
    const aliasMap = new Map();
    for (const [canonical, meta] of Object.entries(manifest.languages || {})) {
      aliasMap.set(canonical.toLowerCase(), { canonical, file: meta.file });
      for (const alias of meta.aliases || []) {
        aliasMap.set(String(alias).toLowerCase(), { canonical, file: meta.file });
      }
    }
    _langAliasMap = aliasMap;
  } catch (_) {
    _langAliasMap = new Map();
  }
  return _langAliasMap;
}

function extractCodeBlockLangs(markdown) {
  const langs = new Set();
  const re = /^```([A-Za-z0-9_+#.\-]+)/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const tag = m[1].toLowerCase();
    if (AIO_INFO_RE.test(tag)) continue;
    langs.add(tag);
  }
  return langs;
}

async function resolveInlineLangFiles(markdown) {
  const aliasMap = await loadLangAliasMap();
  const used = extractCodeBlockLangs(markdown);
  const resolved = new Map();
  for (const tag of used) {
    const hit = aliasMap.get(tag);
    if (hit && !resolved.has(hit.canonical)) resolved.set(hit.canonical, hit.file);
  }
  return Array.from(resolved.values()).sort();
}

function parseBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i += 1) {
    const fence = lines[i].match(/^```([A-Za-z0-9:_.@-]+)?\s*$/);
    if (!fence) continue;
    const info = fence[1] || "";
    const startLine = i + 1;
    const body = [];
    i += 1;
    while (i < lines.length && !/^```\s*$/.test(lines[i])) {
      body.push(lines[i]);
      i += 1;
    }
    blocks.push({ info, code: body.join("\n"), line: startLine });
  }
  return blocks;
}

function parseAioInfo(info) {
  const match = String(info || "").match(AIO_INFO_RE);
  if (!match) return null;
  return { id: `${match[1]}@${match[2]}`, name: match[1], major: Number(match[2]) };
}

function fail(message) {
  throw new Error(message);
}

function requireArray(value, path) {
  if (!Array.isArray(value)) fail(`${path} must be an array`);
}

function requireString(value, path) {
  if (typeof value !== "string" || !value.trim()) fail(`${path} must be a non-empty string`);
}

function plain(value, path, maxLength) {
  requireString(value, path);
  if (value.length > maxLength) fail(`${path} exceeds ${maxLength} characters`);
  if (/[<>]/.test(value)) fail(`${path} must be plain text without HTML`);
}

function rejectUnknownKeys(value, allowed, path) {
  Object.keys(value || {}).forEach((key) => {
    if (!allowed.includes(key)) fail(`${path}.${key} is not allowed`);
  });
}

function validateTable(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "caption", "columns", "rows", "filterable"], "table");
  if (data.title) plain(data.title, "table.title", 100);
  if (data.subtitle) plain(data.subtitle, "table.subtitle", 160);
  if (data.caption) plain(data.caption, "table.caption", 180);
  requireArray(data.columns, "table.columns");
  requireArray(data.rows, "table.rows");
  if (data.columns.length < 1 || data.columns.length > MAX_COLUMNS) fail(`table.columns must contain 1-${MAX_COLUMNS} items`);
  if (data.rows.length > MAX_ROWS) fail(`table.rows must contain at most ${MAX_ROWS} rows`);
  data.columns.forEach((column, index) => plain(column, `table.columns[${index}]`, 80));
  data.rows.forEach((row, rowIndex) => {
    requireArray(row, `table.rows[${rowIndex}]`);
    if (row.length !== data.columns.length) fail(`table.rows[${rowIndex}] must match columns length`);
    row.forEach((cell, cellIndex) => {
      const type = typeof cell;
      if (type !== "string" && type !== "number" && type !== "boolean") fail(`table.rows[${rowIndex}][${cellIndex}] must be string, number, or boolean`);
      if (String(cell).length > MAX_TEXT_LENGTH) fail(`table.rows[${rowIndex}][${cellIndex}] exceeds ${MAX_TEXT_LENGTH} characters`);
      if (/[<>]/.test(String(cell))) fail(`table.rows[${rowIndex}][${cellIndex}] must not contain HTML`);
    });
  });
}

function validateMetricCards(data) {
  rejectUnknownKeys(data, ["title", "items"], "metric-cards");
  if (data.title) plain(data.title, "metric-cards.title", 100);
  requireArray(data.items, "metric-cards.items");
  if (data.items.length < 1 || data.items.length > MAX_METRICS) fail(`metric-cards.items must contain 1-${MAX_METRICS} items`);
  data.items.forEach((item, index) => {
    rejectUnknownKeys(item, ["label", "value", "note", "tone"], `metric-cards.items[${index}]`);
    plain(item.label, `metric-cards.items[${index}].label`, 80);
    plain(item.value, `metric-cards.items[${index}].value`, 40);
    if (item.note) plain(item.note, `metric-cards.items[${index}].note`, 120);
    if (item.tone && !["neutral", "good", "warn", "bad"].includes(item.tone)) fail(`metric-cards.items[${index}].tone must be neutral, good, warn, or bad`);
  });
}

function validateCallout(data) {
  rejectUnknownKeys(data, ["tone", "title", "body", "items"], "callout");
  if (data.tone && !["info", "success", "warning", "danger"].includes(data.tone)) fail("callout.tone must be info, success, warning, or danger");
  plain(data.title, "callout.title", 120);
  plain(data.body, "callout.body", 900);
  if (data.items !== undefined) {
    requireArray(data.items, "callout.items");
    if (data.items.length > 8) fail("callout.items must contain at most 8 items");
    data.items.forEach((item, index) => plain(item, `callout.items[${index}]`, 180));
  }
}

const CHART_TYPES = ["line", "bar", "area", "pie", "donut"];
const CHART_TONES = ["neutral", "good", "warn", "bad", "accent"];
const MAX_CHART_X = 50;
const MAX_CHART_SERIES = 6;
const MAX_CHART_SLICES = 12;

function finiteNumber(value, path) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${path} must be a finite number`);
}

function validateChart(data) {
  rejectUnknownKeys(
    data,
    ["type", "title", "subtitle", "caption", "xLabel", "yLabel", "x", "series", "slices"],
    "chart"
  );
  if (!data || typeof data.type !== "string" || !CHART_TYPES.includes(data.type)) {
    fail(`chart.type must be one of: ${CHART_TYPES.join(", ")}`);
  }
  if (data.title) plain(data.title, "chart.title", 100);
  if (data.subtitle) plain(data.subtitle, "chart.subtitle", 160);
  if (data.caption) plain(data.caption, "chart.caption", 180);
  if (data.xLabel) plain(data.xLabel, "chart.xLabel", 40);
  if (data.yLabel) plain(data.yLabel, "chart.yLabel", 40);

  const isPie = data.type === "pie" || data.type === "donut";
  if (isPie) {
    if (data.x !== undefined || data.series !== undefined) {
      fail("chart of type pie/donut must not include x or series");
    }
    requireArray(data.slices, "chart.slices");
    if (data.slices.length < 1 || data.slices.length > MAX_CHART_SLICES) {
      fail(`chart.slices must contain 1-${MAX_CHART_SLICES} entries`);
    }
    let hasPositive = false;
    data.slices.forEach((slice, index) => {
      rejectUnknownKeys(slice, ["label", "value", "tone"], `chart.slices[${index}]`);
      plain(slice.label, `chart.slices[${index}].label`, 80);
      finiteNumber(slice.value, `chart.slices[${index}].value`);
      if (slice.value < 0) fail(`chart.slices[${index}].value must be non-negative`);
      if (slice.value > 0) hasPositive = true;
      if (slice.tone && !CHART_TONES.includes(slice.tone)) {
        fail(`chart.slices[${index}].tone must be one of: ${CHART_TONES.join(", ")}`);
      }
    });
    if (!hasPositive) fail("chart.slices must contain at least one slice with value > 0");
    return;
  }

  if (data.slices !== undefined) {
    fail("chart of type line/bar/area must not include slices");
  }
  requireArray(data.x, "chart.x");
  if (data.x.length < 1 || data.x.length > MAX_CHART_X) {
    fail(`chart.x must contain 1-${MAX_CHART_X} entries`);
  }
  data.x.forEach((label, index) => plain(label, `chart.x[${index}]`, 40));

  requireArray(data.series, "chart.series");
  if (data.series.length < 1 || data.series.length > MAX_CHART_SERIES) {
    fail(`chart.series must contain 1-${MAX_CHART_SERIES} entries`);
  }
  data.series.forEach((s, index) => {
    rejectUnknownKeys(s, ["name", "data", "tone"], `chart.series[${index}]`);
    plain(s.name, `chart.series[${index}].name`, 80);
    requireArray(s.data, `chart.series[${index}].data`);
    if (s.data.length !== data.x.length) {
      fail(`chart.series[${index}].data must have length ${data.x.length} (matching chart.x)`);
    }
    s.data.forEach((v, j) => finiteNumber(v, `chart.series[${index}].data[${j}]`));
    if (s.tone && !CHART_TONES.includes(s.tone)) {
      fail(`chart.series[${index}].tone must be one of: ${CHART_TONES.join(", ")}`);
    }
  });
}

const MAX_TREND_ITEMS = 8;
const MAX_STATUS_ITEMS = 12;
const MAX_TIMELINE_ITEMS = 30;
const MAX_ACTION_ITEMS = 30;
const MAX_COMPARISON_OPTIONS = 6;
const MAX_COMPARISON_CRITERIA = 14;
const TREND_TONES = ["neutral", "good", "warn", "bad"];
const STATUS_TONES = ["good", "warn", "bad", "neutral", "info"];
const TIMELINE_TONES = ["info", "good", "warn", "bad", "neutral"];
const ACTION_STATUSES = ["todo", "doing", "done", "blocked"];
const ACTION_PRIORITIES = ["P0", "P1", "P2", "P3"];
const DELTA_DIRECTIONS = ["up", "down", "flat"];
const REPORT_STATUSES = ["draft", "review", "final", "archived"];
const REPORT_CLASSIFICATIONS = ["public", "internal", "confidential", "restricted"];
const SAFE_FORMAT_RE = /^(?:raw|number|percent|compact|currency:[A-Z]{3})$/;

function validateFormat(value, path) {
  if (value === undefined) return;
  if (typeof value !== "string" || !SAFE_FORMAT_RE.test(value)) {
    fail(`${path} must be one of raw, number, percent, compact, or currency:CCY (ISO 4217)`);
  }
}

function validateAsOf(value, path) {
  if (value === undefined) return;
  plain(value, path, 40);
}

function validateTrendCard(data) {
  rejectUnknownKeys(data, ["title", "asOf", "items"], "trend-card");
  if (data.title) plain(data.title, "trend-card.title", 100);
  validateAsOf(data.asOf, "trend-card.asOf");
  requireArray(data.items, "trend-card.items");
  if (data.items.length < 1 || data.items.length > MAX_TREND_ITEMS) fail(`trend-card.items must contain 1-${MAX_TREND_ITEMS} items`);
  data.items.forEach((item, i) => {
    const base = `trend-card.items[${i}]`;
    rejectUnknownKeys(item, ["label", "value", "format", "delta", "spark", "tone", "note"], base);
    plain(item.label, `${base}.label`, 80);
    if (item.value === undefined) fail(`${base}.value is required`);
    if (typeof item.value === "string") plain(item.value, `${base}.value`, 40);
    else if (typeof item.value !== "number" || !Number.isFinite(item.value)) fail(`${base}.value must be a finite number or short string`);
    validateFormat(item.format, `${base}.format`);
    if (item.tone && !TREND_TONES.includes(item.tone)) fail(`${base}.tone must be one of: ${TREND_TONES.join(", ")}`);
    if (item.note) plain(item.note, `${base}.note`, 140);
    if (item.delta !== undefined) {
      rejectUnknownKeys(item.delta, ["value", "direction", "format", "label"], `${base}.delta`);
      finiteNumber(item.delta.value, `${base}.delta.value`);
      if (item.delta.direction && !DELTA_DIRECTIONS.includes(item.delta.direction)) fail(`${base}.delta.direction must be one of: ${DELTA_DIRECTIONS.join(", ")}`);
      validateFormat(item.delta.format, `${base}.delta.format`);
      if (item.delta.label) plain(item.delta.label, `${base}.delta.label`, 40);
    }
    if (item.spark !== undefined) {
      requireArray(item.spark, `${base}.spark`);
      if (item.spark.length < 2 || item.spark.length > 60) fail(`${base}.spark must contain 2-60 numbers`);
      item.spark.forEach((v, j) => finiteNumber(v, `${base}.spark[${j}]`));
    }
  });
}

function validateStatusGrid(data) {
  rejectUnknownKeys(data, ["title", "asOf", "items"], "status-grid");
  if (data.title) plain(data.title, "status-grid.title", 100);
  validateAsOf(data.asOf, "status-grid.asOf");
  requireArray(data.items, "status-grid.items");
  if (data.items.length < 1 || data.items.length > MAX_STATUS_ITEMS) fail(`status-grid.items must contain 1-${MAX_STATUS_ITEMS} items`);
  data.items.forEach((item, i) => {
    const base = `status-grid.items[${i}]`;
    rejectUnknownKeys(item, ["label", "status", "value", "note"], base);
    plain(item.label, `${base}.label`, 80);
    if (!STATUS_TONES.includes(item.status)) fail(`${base}.status must be one of: ${STATUS_TONES.join(", ")}`);
    if (item.value) plain(item.value, `${base}.value`, 60);
    if (item.note) plain(item.note, `${base}.note`, 140);
  });
}

function validateReportHeader(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "period", "author", "status", "dataAsOf", "classification", "badges"], "report-header");
  plain(data.title, "report-header.title", 140);
  if (data.subtitle) plain(data.subtitle, "report-header.subtitle", 200);
  if (data.period) plain(data.period, "report-header.period", 60);
  if (data.author) plain(data.author, "report-header.author", 80);
  if (data.status && !REPORT_STATUSES.includes(data.status)) fail(`report-header.status must be one of: ${REPORT_STATUSES.join(", ")}`);
  if (data.dataAsOf) validateAsOf(data.dataAsOf, "report-header.dataAsOf");
  if (data.classification && !REPORT_CLASSIFICATIONS.includes(data.classification)) fail(`report-header.classification must be one of: ${REPORT_CLASSIFICATIONS.join(", ")}`);
  if (data.badges !== undefined) {
    requireArray(data.badges, "report-header.badges");
    if (data.badges.length > 6) fail("report-header.badges must contain at most 6 items");
    data.badges.forEach((b, i) => {
      rejectUnknownKeys(b, ["label", "tone"], `report-header.badges[${i}]`);
      plain(b.label, `report-header.badges[${i}].label`, 40);
      if (b.tone && !["info", "good", "warn", "bad", "neutral"].includes(b.tone)) fail(`report-header.badges[${i}].tone must be one of: info, good, warn, bad, neutral`);
    });
  }
}

function validateTimeline(data) {
  rejectUnknownKeys(data, ["title", "asOf", "items"], "timeline");
  if (data.title) plain(data.title, "timeline.title", 100);
  validateAsOf(data.asOf, "timeline.asOf");
  requireArray(data.items, "timeline.items");
  if (data.items.length < 1 || data.items.length > MAX_TIMELINE_ITEMS) fail(`timeline.items must contain 1-${MAX_TIMELINE_ITEMS} items`);
  data.items.forEach((item, i) => {
    const base = `timeline.items[${i}]`;
    rejectUnknownKeys(item, ["time", "title", "body", "tone"], base);
    plain(item.time, `${base}.time`, 60);
    plain(item.title, `${base}.title`, 120);
    if (item.body) plain(item.body, `${base}.body`, 400);
    if (item.tone && !TIMELINE_TONES.includes(item.tone)) fail(`${base}.tone must be one of: ${TIMELINE_TONES.join(", ")}`);
  });
}

function validateActionItems(data) {
  rejectUnknownKeys(data, ["title", "asOf", "items"], "action-items");
  if (data.title) plain(data.title, "action-items.title", 100);
  validateAsOf(data.asOf, "action-items.asOf");
  requireArray(data.items, "action-items.items");
  if (data.items.length < 1 || data.items.length > MAX_ACTION_ITEMS) fail(`action-items.items must contain 1-${MAX_ACTION_ITEMS} items`);
  data.items.forEach((item, i) => {
    const base = `action-items.items[${i}]`;
    rejectUnknownKeys(item, ["task", "owner", "due", "status", "priority"], base);
    plain(item.task, `${base}.task`, 240);
    if (item.owner) plain(item.owner, `${base}.owner`, 60);
    if (item.due) plain(item.due, `${base}.due`, 30);
    if (item.status && !ACTION_STATUSES.includes(item.status)) fail(`${base}.status must be one of: ${ACTION_STATUSES.join(", ")}`);
    if (item.priority && !ACTION_PRIORITIES.includes(item.priority)) fail(`${base}.priority must be one of: ${ACTION_PRIORITIES.join(", ")}`);
  });
}

function validateComparison(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "asOf", "options", "recommended", "criteria"], "comparison");
  if (data.title) plain(data.title, "comparison.title", 100);
  if (data.subtitle) plain(data.subtitle, "comparison.subtitle", 160);
  validateAsOf(data.asOf, "comparison.asOf");
  requireArray(data.options, "comparison.options");
  if (data.options.length < 2 || data.options.length > MAX_COMPARISON_OPTIONS) fail(`comparison.options must contain 2-${MAX_COMPARISON_OPTIONS} entries`);
  data.options.forEach((opt, i) => plain(opt, `comparison.options[${i}]`, 60));
  if (data.recommended !== undefined) {
    plain(data.recommended, "comparison.recommended", 60);
    if (!data.options.includes(data.recommended)) fail("comparison.recommended must match one of the options");
  }
  requireArray(data.criteria, "comparison.criteria");
  if (data.criteria.length < 1 || data.criteria.length > MAX_COMPARISON_CRITERIA) fail(`comparison.criteria must contain 1-${MAX_COMPARISON_CRITERIA} entries`);
  data.criteria.forEach((c, i) => {
    const base = `comparison.criteria[${i}]`;
    rejectUnknownKeys(c, ["label", "values", "weight", "tone"], base);
    plain(c.label, `${base}.label`, 80);
    requireArray(c.values, `${base}.values`);
    if (c.values.length !== data.options.length) fail(`${base}.values must match comparison.options length`);
    c.values.forEach((v, j) => {
      const t = typeof v;
      if (t !== "string" && t !== "number" && t !== "boolean") fail(`${base}.values[${j}] must be string, number, or boolean`);
      if (String(v).length > 80) fail(`${base}.values[${j}] exceeds 80 characters`);
      if (/[<>]/.test(String(v))) fail(`${base}.values[${j}] must not contain HTML`);
    });
    if (c.weight !== undefined) finiteNumber(c.weight, `${base}.weight`);
    if (c.tone && !["good", "warn", "bad", "neutral"].includes(c.tone)) fail(`${base}.tone must be one of: good, warn, bad, neutral`);
  });
}

const MAX_GAUGE_ITEMS = 8;
const MAX_FUNNEL_STAGES = 8;
const MAX_WATERFALL_BARS = 14;
const MAX_HEATMAP_X = 32;
const MAX_HEATMAP_Y = 32;
const MAX_MATRIX_ITEMS = 24;
const WATERFALL_KINDS = ["start", "up", "down", "subtotal", "end"];
const HEATMAP_TONES = ["accent", "good", "warn", "bad", "neutral"];

function validateGauge(data) {
  rejectUnknownKeys(data, ["title", "asOf", "items"], "gauge");
  if (data.title) plain(data.title, "gauge.title", 100);
  validateAsOf(data.asOf, "gauge.asOf");
  requireArray(data.items, "gauge.items");
  if (data.items.length < 1 || data.items.length > MAX_GAUGE_ITEMS) fail(`gauge.items must contain 1-${MAX_GAUGE_ITEMS} items`);
  data.items.forEach((item, i) => {
    const base = `gauge.items[${i}]`;
    rejectUnknownKeys(item, ["label", "value", "target", "min", "max", "format", "tone", "note"], base);
    plain(item.label, `${base}.label`, 80);
    finiteNumber(item.value, `${base}.value`);
    if (item.min !== undefined) finiteNumber(item.min, `${base}.min`);
    if (item.max !== undefined) finiteNumber(item.max, `${base}.max`);
    if (item.target !== undefined) finiteNumber(item.target, `${base}.target`);
    validateFormat(item.format, `${base}.format`);
    if (item.tone && !TREND_TONES.includes(item.tone)) fail(`${base}.tone must be one of: ${TREND_TONES.join(", ")}`);
    if (item.note) plain(item.note, `${base}.note`, 140);
    const min = item.min !== undefined ? item.min : 0;
    const max = item.max !== undefined ? item.max : (item.format === "percent" ? 1 : 100);
    if (max <= min) fail(`${base}.max must be greater than min`);
  });
}

function validateFunnel(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "asOf", "format", "stages"], "funnel");
  if (data.title) plain(data.title, "funnel.title", 100);
  if (data.subtitle) plain(data.subtitle, "funnel.subtitle", 160);
  validateAsOf(data.asOf, "funnel.asOf");
  validateFormat(data.format, "funnel.format");
  requireArray(data.stages, "funnel.stages");
  if (data.stages.length < 2 || data.stages.length > MAX_FUNNEL_STAGES) fail(`funnel.stages must contain 2-${MAX_FUNNEL_STAGES} stages`);
  let prev = Infinity;
  data.stages.forEach((stage, i) => {
    const base = `funnel.stages[${i}]`;
    rejectUnknownKeys(stage, ["label", "value", "tone", "note"], base);
    plain(stage.label, `${base}.label`, 80);
    finiteNumber(stage.value, `${base}.value`);
    if (stage.value < 0) fail(`${base}.value must be non-negative`);
    if (stage.value > prev) fail(`${base}.value must be <= the previous stage value`);
    prev = stage.value;
    if (stage.tone && !TREND_TONES.includes(stage.tone)) fail(`${base}.tone must be one of: ${TREND_TONES.join(", ")}`);
    if (stage.note) plain(stage.note, `${base}.note`, 140);
  });
}

function validateWaterfall(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "asOf", "format", "bars"], "waterfall");
  if (data.title) plain(data.title, "waterfall.title", 100);
  if (data.subtitle) plain(data.subtitle, "waterfall.subtitle", 160);
  validateAsOf(data.asOf, "waterfall.asOf");
  validateFormat(data.format, "waterfall.format");
  requireArray(data.bars, "waterfall.bars");
  if (data.bars.length < 2 || data.bars.length > MAX_WATERFALL_BARS) fail(`waterfall.bars must contain 2-${MAX_WATERFALL_BARS} bars`);
  data.bars.forEach((bar, i) => {
    const base = `waterfall.bars[${i}]`;
    rejectUnknownKeys(bar, ["label", "value", "kind", "note"], base);
    plain(bar.label, `${base}.label`, 60);
    finiteNumber(bar.value, `${base}.value`);
    if (!WATERFALL_KINDS.includes(bar.kind)) fail(`${base}.kind must be one of: ${WATERFALL_KINDS.join(", ")}`);
    if (bar.note) plain(bar.note, `${base}.note`, 140);
  });
  if (data.bars[0].kind !== "start") fail("waterfall.bars[0].kind must be 'start'");
}

function validateHeatmap(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "asOf", "xLabels", "yLabels", "rows", "format", "tone"], "heatmap");
  if (data.title) plain(data.title, "heatmap.title", 100);
  if (data.subtitle) plain(data.subtitle, "heatmap.subtitle", 160);
  validateAsOf(data.asOf, "heatmap.asOf");
  validateFormat(data.format, "heatmap.format");
  if (data.tone && !HEATMAP_TONES.includes(data.tone)) fail(`heatmap.tone must be one of: ${HEATMAP_TONES.join(", ")}`);
  requireArray(data.xLabels, "heatmap.xLabels");
  requireArray(data.yLabels, "heatmap.yLabels");
  if (data.xLabels.length < 1 || data.xLabels.length > MAX_HEATMAP_X) fail(`heatmap.xLabels must contain 1-${MAX_HEATMAP_X} entries`);
  if (data.yLabels.length < 1 || data.yLabels.length > MAX_HEATMAP_Y) fail(`heatmap.yLabels must contain 1-${MAX_HEATMAP_Y} entries`);
  data.xLabels.forEach((l, i) => plain(l, `heatmap.xLabels[${i}]`, 24));
  data.yLabels.forEach((l, i) => plain(l, `heatmap.yLabels[${i}]`, 24));
  requireArray(data.rows, "heatmap.rows");
  if (data.rows.length !== data.yLabels.length) fail("heatmap.rows length must equal yLabels length");
  data.rows.forEach((row, i) => {
    requireArray(row, `heatmap.rows[${i}]`);
    if (row.length !== data.xLabels.length) fail(`heatmap.rows[${i}] length must equal xLabels length`);
    row.forEach((v, j) => finiteNumber(v, `heatmap.rows[${i}][${j}]`));
  });
}

function validateMatrix(data) {
  rejectUnknownKeys(data, ["title", "subtitle", "asOf", "xLabel", "yLabel", "xMin", "xMax", "yMin", "yMax", "quadrants", "items"], "matrix");
  if (data.title) plain(data.title, "matrix.title", 100);
  if (data.subtitle) plain(data.subtitle, "matrix.subtitle", 160);
  validateAsOf(data.asOf, "matrix.asOf");
  if (data.xLabel) plain(data.xLabel, "matrix.xLabel", 40);
  if (data.yLabel) plain(data.yLabel, "matrix.yLabel", 40);
  if (data.xMin !== undefined) finiteNumber(data.xMin, "matrix.xMin");
  if (data.xMax !== undefined) finiteNumber(data.xMax, "matrix.xMax");
  if (data.yMin !== undefined) finiteNumber(data.yMin, "matrix.yMin");
  if (data.yMax !== undefined) finiteNumber(data.yMax, "matrix.yMax");
  const xMin = data.xMin !== undefined ? data.xMin : 0;
  const xMax = data.xMax !== undefined ? data.xMax : 10;
  const yMin = data.yMin !== undefined ? data.yMin : 0;
  const yMax = data.yMax !== undefined ? data.yMax : 10;
  if (xMax <= xMin) fail("matrix.xMax must be greater than xMin");
  if (yMax <= yMin) fail("matrix.yMax must be greater than yMin");
  if (data.quadrants !== undefined) {
    requireArray(data.quadrants, "matrix.quadrants");
    if (data.quadrants.length !== 4) fail("matrix.quadrants must contain exactly 4 labels (top-left, top-right, bottom-left, bottom-right)");
    data.quadrants.forEach((q, i) => plain(q, `matrix.quadrants[${i}]`, 60));
  }
  requireArray(data.items, "matrix.items");
  if (data.items.length < 1 || data.items.length > MAX_MATRIX_ITEMS) fail(`matrix.items must contain 1-${MAX_MATRIX_ITEMS} items`);
  data.items.forEach((item, i) => {
    const base = `matrix.items[${i}]`;
    rejectUnknownKeys(item, ["label", "x", "y", "tone", "note"], base);
    plain(item.label, `${base}.label`, 40);
    finiteNumber(item.x, `${base}.x`);
    finiteNumber(item.y, `${base}.y`);
    if (item.x < xMin || item.x > xMax) fail(`${base}.x must be between xMin and xMax`);
    if (item.y < yMin || item.y > yMax) fail(`${base}.y must be between yMin and yMax`);
    if (item.tone && !TREND_TONES.includes(item.tone)) fail(`${base}.tone must be one of: ${TREND_TONES.join(", ")}`);
    if (item.note) plain(item.note, `${base}.note`, 120);
  });
}

const validators = new Map([
  ["table@1", validateTable],
  ["metric-cards@1", validateMetricCards],
  ["callout@1", validateCallout],
  ["chart@1", validateChart],
  ["trend-card@1", validateTrendCard],
  ["status-grid@1", validateStatusGrid],
  ["report-header@1", validateReportHeader],
  ["timeline@1", validateTimeline],
  ["action-items@1", validateActionItems],
  ["comparison@1", validateComparison],
  ["gauge@1", validateGauge],
  ["funnel@1", validateFunnel],
  ["waterfall@1", validateWaterfall],
  ["heatmap@1", validateHeatmap],
  ["matrix@1", validateMatrix]
]);

function extractFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return { frontmatter: null, body: markdown };
  const lines = markdown.split(/\n/);
  if (lines[0].trim() !== "---") return { frontmatter: null, body: markdown };
  let endIdx = -1;
  for (let i = 1; i < lines.length && i < 80; i++) {
    if (lines[i].trim() === "---") { endIdx = i; break; }
  }
  if (endIdx < 0) return { frontmatter: null, body: markdown };
  const fm = {};
  for (let i = 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][\w.-]*)\s*:\s*(.*)$/);
    if (!m) return { frontmatter: null, body: markdown };
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    }
    fm[m[1]] = val;
  }
  const body = lines.slice(endIdx + 1).join("\n").replace(/^\s+/, "");
  return { frontmatter: fm, body };
}

function frontmatterToReportHeader(fm) {
  if (!fm) return null;
  const data = {};
  const map = { title: "title", subtitle: "subtitle", period: "period", author: "author", status: "status", classification: "classification" };
  for (const [from, to] of Object.entries(map)) {
    if (typeof fm[from] === "string") data[to] = fm[from];
  }
  const asOf = fm["data-as-of"] || fm.dataAsOf;
  if (typeof asOf === "string") data.dataAsOf = asOf;
  if (Array.isArray(fm.badges)) data.badges = fm.badges.map((label) => ({ label: String(label) }));
  return data.title ? data : null;
}

function frontmatterBooleanOff(value) {
  if (value === undefined) return null;
  const s = String(value).toLowerCase();
  if (s === "off" || s === "false" || s === "no" || s === "0") return false;
  if (s === "on" || s === "true" || s === "yes" || s === "1") return true;
  return null;
}

function applyFrontmatter(markdown) {
  const { frontmatter, body } = extractFrontmatter(markdown);
  if (!frontmatter) return { markdown, frontmatter: null };
  const headerData = frontmatterToReportHeader(frontmatter);
  let finalBody = body;
  if (headerData && !/```aio:report-header@1/.test(body)) {
    const block = "```aio:report-header@1\n" + JSON.stringify(headerData, null, 2) + "\n```\n\n";
    finalBody = block + body;
  }
  return { markdown: finalBody, frontmatter };
}

function validateMarkdown(markdown) {
  const diagnostics = [];
  parseBlocks(markdown).forEach((block) => {
    const aio = parseAioInfo(block.info);
    if (!aio) return;
    if (!validators.has(aio.id)) {
      diagnostics.push({ line: block.line, info: block.info, message: `${block.info} is not supported` });
      return;
    }
    try {
      const data = JSON.parse(block.code);
      validators.get(aio.id)(data);
    } catch (error) {
      diagnostics.push({ line: block.line, info: block.info, message: error.message });
    }
  });
  return diagnostics;
}

function escapeScriptText(value) {
  return String(value).replace(/<\/script/gi, "<\\/script");
}

function isHttpsUrl(value) {
  return /^https:\/\//i.test(value);
}

const SAFE_RUNTIME_CHARS = /^[A-Za-z0-9._~\-:/?#@!$&()*+,;=]+$/;

function assertSafeRuntimeSrc(value) {
  if (typeof value !== "string" || !value) {
    throw new Error("--runtime must be a non-empty string");
  }
  if (/[<>"'\\\s\u0000-\u001f]/.test(value)) {
    throw new Error("--runtime must not contain quotes, angle brackets, backslashes, or whitespace");
  }
  if (value.includes("..")) {
    throw new Error("--runtime must not contain path traversal");
  }
  if (isHttpsUrl(value)) {
    if (!SAFE_RUNTIME_CHARS.test(value)) {
      throw new Error("--runtime URL contains disallowed characters");
    }
    return;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(value)) {
    throw new Error("--runtime only accepts https:// URLs or relative/absolute file paths");
  }
  if (!SAFE_RUNTIME_CHARS.test(value)) {
    throw new Error("--runtime path contains disallowed characters");
  }
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function buildRuntimeTag(runtime, outPath, markdown) {
  if (runtime.inline) {
    const code = await readFile(BUNDLED_RUNTIME_PATH, "utf8");
    const langFiles = await resolveInlineLangFiles(markdown || "");
    let tags = `<script>${escapeScriptText(code)}</script>`;
    for (const file of langFiles) {
      const langCode = await readFile(resolve(LANG_DIR, file), "utf8");
      tags += `\n  <script>${escapeScriptText(langCode)}</script>`;
    }
    return tags;
  }
  assertSafeRuntimeSrc(runtime.src);
  if (isHttpsUrl(runtime.src)) {
    return `<script src="${escapeHtmlAttr(runtime.src)}"></script>`;
  }
  const absSrc = isAbsolute(runtime.src) ? runtime.src : resolve(process.cwd(), runtime.src);
  const rel = relative(dirname(outPath), absSrc).split("\\").join("/");
  return `<script src="${escapeHtmlAttr(rel || basename(absSrc))}"></script>`;
}

const SAFE_LANG_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;

function safeLang(lang) {
  if (!lang) return "en";
  if (!SAFE_LANG_RE.test(lang)) {
    throw new Error("--lang must look like a BCP47 tag, e.g. en, zh-CN, ja, ar-SA");
  }
  return lang;
}

async function standaloneHtml(markdown, runtime, outPath, opts) {
  const runtimeTag = await buildRuntimeTag(runtime, outPath, markdown);
  const lang = safeLang(opts.lang);
  const locale = lang;
  const theme = opts.theme === "dark" || opts.theme === "light" ? opts.theme : "";
  const themeAttr = theme ? ` data-ai-theme="${theme}"` : "";
  const renderOpts = JSON.stringify({
    target: "#app",
    title: "AI Output Runtime v0.1",
    locale,
    theme: theme || undefined,
    langBaseUrl: opts.langBaseUrl || undefined,
    numbering: opts.numbering === false ? false : undefined,
    summary: opts.summary === false ? false : undefined
  });
  return `<!doctype html>
<html lang="${escapeHtmlAttr(lang)}"${themeAttr}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Output Runtime</title>
  ${runtimeTag}
</head>
<body>
  <div id="app"></div>
  <script id="ai-source" type="text/plain">${escapeScriptText(markdown)}</script>
  <script>
    AIOutputRuntime.render(document.getElementById("ai-source").textContent.trim(), ${renderOpts});
  </script>
</body>
</html>
`;
}

function parseFlag(rest, name) {
  const idx = rest.indexOf(name);
  if (idx < 0) return undefined;
  const value = rest[idx + 1];
  if (value === undefined || value.startsWith("--")) {
    return "";
  }
  return value;
}

function hasFlag(rest, name) {
  return rest.includes(name);
}

function printUsage() {
  console.error(`Usage:
  aio validate <file.md>
  aio render   <file.md> [--out <file.html>] [--runtime <url|path>] [--inline-runtime] [--lang <tag>] [--theme <light|dark>] [--lang-base-url <url>]

render options:
  --out <file.html>      Output HTML path (default: <input>.html alongside input)
  --runtime <url|path>   Runtime <script src>. Default: jsDelivr CDN pinned to ${RUNTIME_VERSION}
  --inline-runtime       Inline the bundled runtime + any non-builtin language modules used in the markdown
  --lang <bcp47>         Document language and runtime locale (default: en). Currently bundled: en, zh-CN
  --theme <light|dark>   Force a theme; omit to follow the user's system preference (auto)
  --lang-base-url <url>  Override CDN base for lazy-loaded language modules (https only)`);
}

async function main() {
  const [, , command, file, ...rest] = process.argv;
  if (!command || !file || !["validate", "render"].includes(command)) {
    printUsage();
    process.exit(2);
  }

  const inputPath = resolve(file);
  const raw = await readFile(inputPath, "utf8");
  if (Buffer.byteLength(raw, "utf8") > MAX_INPUT_BYTES) {
    console.error(`${file}: input exceeds ${MAX_INPUT_BYTES} bytes`);
    process.exit(1);
  }
  const { markdown, frontmatter } = applyFrontmatter(raw);
  const diagnostics = validateMarkdown(markdown);

  if (diagnostics.length) {
    diagnostics.forEach((diag) => {
      console.error(`${file}:${diag.line} ${diag.info}: ${diag.message}`);
    });
    process.exit(1);
  }

  if (command === "validate") {
    console.log(`OK ${file}`);
    return;
  }

  const explicitOut = parseFlag(rest, "--out");
  const outPath = explicitOut || inputPath.replace(new RegExp(`${extname(inputPath)}$`), "") + ".html";

  const runtimeOverride = parseFlag(rest, "--runtime");
  const inline = hasFlag(rest, "--inline-runtime");
  if (inline && runtimeOverride) {
    console.error("--inline-runtime cannot be combined with --runtime");
    process.exit(2);
  }
  const runtime = {
    inline,
    src: runtimeOverride || DEFAULT_RUNTIME_URL
  };

  const lang = parseFlag(rest, "--lang") || "en";
  const themeFlag = parseFlag(rest, "--theme");
  if (themeFlag && themeFlag !== "light" && themeFlag !== "dark") {
    console.error("--theme must be 'light' or 'dark' (omit for auto)");
    process.exit(2);
  }

  const langBaseUrl = parseFlag(rest, "--lang-base-url");
  if (langBaseUrl) {
    if (!/^https?:\/\/[^\s"'`<>]+$/.test(langBaseUrl)) {
      console.error("--lang-base-url must be an http(s):// URL with no whitespace or quotes");
      process.exit(2);
    }
  }

  const resolvedOut = resolve(outPath);
  await mkdir(dirname(resolvedOut), { recursive: true });
  const numbering = frontmatter ? frontmatterBooleanOff(frontmatter.numbering) : null;
  const summary = frontmatter ? frontmatterBooleanOff(frontmatter.summary) : null;
  const html = await standaloneHtml(markdown, runtime, resolvedOut, {
    lang, theme: themeFlag, langBaseUrl,
    numbering: numbering === false ? false : undefined,
    summary: summary === false ? false : undefined
  });
  await writeFile(resolvedOut, html, "utf8");
  console.log(`Rendered ${outPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
