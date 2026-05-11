#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, basename, extname, isAbsolute, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AIO_INFO_RE = /^aio:([a-z][a-z0-9-]*)@([1-9][0-9]*)(?:\.([0-9]+))?$/;
const MAX_TEXT_LENGTH = 600;
const MAX_ROWS = 100;
const MAX_COLUMNS = 12;
const MAX_METRICS = 8;
const RUNTIME_VERSION = "v0.1.0";
const DEFAULT_RUNTIME_URL = `https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime-g@${RUNTIME_VERSION}/assets/ai-output-runtime.js`;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const BUNDLED_RUNTIME_PATH = resolve(SCRIPT_DIR, "../assets/ai-output-runtime.js");

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

const validators = new Map([
  ["table@1", validateTable],
  ["metric-cards@1", validateMetricCards],
  ["callout@1", validateCallout]
]);

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

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value);
}

async function buildRuntimeTag(runtime, outPath) {
  if (runtime.inline) {
    const code = await readFile(BUNDLED_RUNTIME_PATH, "utf8");
    return `<script>${escapeScriptText(code)}</script>`;
  }
  if (isRemoteUrl(runtime.src)) {
    return `<script src="${runtime.src}"></script>`;
  }
  const absSrc = isAbsolute(runtime.src) ? runtime.src : resolve(process.cwd(), runtime.src);
  const rel = relative(dirname(outPath), absSrc).split("\\").join("/");
  return `<script src="${rel || basename(absSrc)}"></script>`;
}

async function standaloneHtml(markdown, runtime, outPath) {
  const runtimeTag = await buildRuntimeTag(runtime, outPath);
  return `<!doctype html>
<html lang="zh-CN">
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
    AIOutputRuntime.render(document.getElementById("ai-source").textContent.trim(), {
      target: "#app",
      title: "AI Output Runtime v0.1"
    });
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
  aio render   <file.md> [--out <file.html>] [--runtime <url|path>] [--inline-runtime]

render options:
  --out <file.html>      Output HTML path (default: <input>.html alongside input)
  --runtime <url|path>   Runtime <script src>. Default: jsDelivr CDN pinned to ${RUNTIME_VERSION}
  --inline-runtime       Inline the bundled runtime so the HTML works offline / via file://`);
}

async function main() {
  const [, , command, file, ...rest] = process.argv;
  if (!command || !file || !["validate", "render"].includes(command)) {
    printUsage();
    process.exit(2);
  }

  const inputPath = resolve(file);
  const markdown = await readFile(inputPath, "utf8");
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

  const resolvedOut = resolve(outPath);
  await mkdir(dirname(resolvedOut), { recursive: true });
  const html = await standaloneHtml(markdown, runtime, resolvedOut);
  await writeFile(resolvedOut, html, "utf8");
  console.log(`Rendered ${outPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
