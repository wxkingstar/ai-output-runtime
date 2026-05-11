# Launch Playbook — AIO v0.2

A pragmatic three-day window to land AIO in front of the audiences that matter: the people who saw the Thariq Shihipar / Simon Willison discussion, AI builders, agent-skill authors, and report-tooling integrators.

All copy is in [`docs/launch-kit.md`](launch-kit.md). All screenshots are in [`docs/screenshots/`](screenshots/). This file is the **sequencing** — when to post where, in what order, with what handle.

---

## D-1 (day before launch) — prepare

| Task | Owner | Outcome |
|---|---|---|
| Verify [live demo](https://wxkingstar.github.io/ai-output-runtime/) loads in light + dark | self | green |
| Verify CDN URL `@v0.4.3` returns 200 with new code | self | green |
| Stage Hacker News title + body in [`launch-kit.md`](launch-kit.md) | self | ready |
| Stage X / 𝕏 thread (4 posts max) | self | ready |
| Stage Reddit r/ClaudeCode reply (under the original Thariq discussion thread) | self | ready |
| Stage Product Hunt listing (logo, screenshots, taglines) | self | ready |
| Stage Chinese 即刻 / V2EX / 知乎 posts | self | ready |
| Stage Japanese Qiita / Zenn / X posts | self | ready |
| Identify 5-10 friendly Twitter accounts that will engage at launch | self | list |

**Definition of ready**: every post can be copy-pasted from `launch-kit.md` with no edits required.

---

## D0 — launch day timeline

Anchor: **Tuesday or Wednesday**, because Product Hunt counts launches in 24-hour windows starting at Pacific midnight, and Tue/Wed get the most exposure.

Times below are anchored to **Pacific Time** (PT). 中国 = PT + 16h, 日本 = PT + 17h.

### Wave 1 — Product Hunt launch (PT 00:01)

1. Submit Product Hunt listing at **00:01 PT** (the moment the day rotates).
2. Use the description from `launch-kit.md` Product Hunt section.
3. Upload `docs/screenshots/landing-light.png` as the hero image.
4. Upload `docs/screenshots/charts-light.png` as the "feature" image.
5. Tag categories: **Developer Tools**, **Artificial Intelligence**, **Open Source**.
6. Reply to first 5 comments within 15 min — sets early engagement signal.

**Why first**: PH 24h window starts immediately; you want all of it.

### Wave 2 — Hacker News + r/ClaudeCode (PT 07:00 ~ 08:00)

Hit HN at **07:00 PT** (peak US morning traffic, EU afternoon).

1. Hacker News submission — title from `launch-kit.md` HN section, link directly to the GitHub repo (not the live demo; HN prefers source over marketing).
2. **First comment from the author** within 2 minutes — repeat the "AI emits data, runtime emits HTML" framing and link the live demo.
3. r/ClaudeCode — post as a **reply** to [the original Thariq discussion](https://www.reddit.com/r/ClaudeCode/comments/1t8vni3/html_markdown_for_claude_code_outputs_thariqs/), not a fresh post. Frame as "I built the middle path".
4. Reddit r/programming — same content, fresh post.

**Why second**: PH gets you votes from the maker/founder crowd. HN gets you the developer-evaluator crowd. Different audiences, two shots.

### Wave 3 — X / 𝕏 thread (PT 08:30)

Once HN is on the front page (or close), drop the X thread.

1. Thread of 4 posts. First post = the hook. Second post = Why this exists / Thariq link. Third post = chart demo screenshot. Fourth post = install + demo link.
2. **Tag @thariqshihipar @simonw @AnthropicAI** in the second post — the discussion participants, not the launch post itself. This is respect, not spam.
3. Pin the thread on your profile for the day.
4. Quote-tweet from any related accounts you have.

### Wave 4 — Chinese communities (CN 22:00 / PT 06:00)

For Chinese audience, sweet spot is **晚上 9-11 点 CN time**, which is **05:00-07:00 PT**. If you anchored the day on PT, this is actually BEFORE wave 2 — so adjust timing as follows:

- **PT 06:00 / CN 22:00**: post to 即刻 + V2EX + 知乎 with the [中文 README](../README.zh-CN.md) link and an emphasis on AI 安全 + 第三条路 angle.
- **PT 06:30 / CN 22:30**: send to internal WeChat groups (AI 创业者、Claude Code 用户群、Inagora 技术群).
- **PT 07:00**: switch to wave 2 (HN).

If you can't multi-task, prioritize HN over CN — HN's window is wider and matters more for cross-pollination.

### Wave 5 — Japanese communities (JST 21:00 / PT 04:00)

For Japan, **21:00 JST** is peak. That's **04:00 PT**, before Product Hunt window even fully opens. Two options:

- **Option A — pre-launch tease**: post to Qiita / Zenn / X (ja) on **D-1 evening JST** (still before PH launch). Plant interest, point to "tomorrow morning" GitHub release.
- **Option B — sync day**: post on D0 21:00 JST (= 04:00 PT D0) — risk: HN/PH momentum hasn't started yet, story feels disconnected.

**Recommendation: Option A.** Japanese AI dev audience appreciates advance notice and bilingual coverage.

### Wave 6 — Korean communities (KST 21:00 / PT 04:00)

Lighter touch than CN/JP since copy is English-only:

- Post to **Disquiet** (Korean maker community).
- Tweet to Korean AI dev hashtags (#AI개발 #LLM).
- Cross-post to relevant Korean Discord communities if accessible.

---

## D+1 — follow-up and amplification

| Task | When | Why |
|---|---|---|
| Reply to every HN comment with substance | continuous | front-page momentum |
| Reply to PH comments and visit upvoters' profiles | continuous | reciprocity |
| Compile **early feedback** (HN, Reddit, X) into a v0.3 backlog | end of D+1 | shows responsiveness |
| Tweet **"24h recap"** — installs, stars, demo views, one piece of surprising feedback | PT 18:00 D+1 | second wave engagement |
| Post a **WeChat / Zhihu follow-up** in Chinese summarizing the day | CN 22:00 D+1 | seal the Chinese campaign |
| Email Thariq / Simon Willison with a polite "thank you for the discussion, here's where it led" note | personal | respectful loop close |

---

## @-mention list (use sparingly, in-context)

These are people directly relevant to the project's origin story. Tag them only when it's genuinely about the discussion they started, never just for amplification.

- **Thariq Shihipar** — Anthropic Claude Code team. The trigger discussion. Tag in "Why this exists" content.
- **Simon Willison** (@simonw) — Wrote about the discussion. Tag when sharing the framing.
- **Anthropic** (@AnthropicAI) — Parent context. Don't expect retweet, do expect indexing.
- **Claude Code** team Twitter — same.
- **OpenAI Codex** team — AIO is agent-agnostic. They might amplify.

**Do NOT tag**: random AI influencers, big-account "ai_news" bots, generic "promote my repo" lists. That's spam and burns the project.

---

## KPIs to track (D0 to D+7)

| Metric | D0 | D+1 | D+7 | Target |
|---|---|---|---|---|
| GitHub stars | | | | 250+ |
| Repo forks | | | | 15+ |
| `npx skills add` installs (via skill registry analytics if available) | | | | 100+ |
| jsDelivr CDN hits / day on `@v0.4.3` | | | | 1000+ |
| HN frontpage time (hours) | | | | 4h+ |
| Product Hunt ranking (end of day) | | | | top 5 |
| GitHub Pages unique visitors | | | | 2000+ |
| X engagement (impressions / retweets / replies) | | | | 10k impressions |

These are aspirational, not pass/fail. Use them to detect channels that under-deliver and reroute on D+1.

---

## Risk handling

### "It flopped" (less than 30 HN points, less than 50 GitHub stars in 24h)

- Don't relaunch the same thing. HN penalizes repost.
- Instead, write a **technical deep-dive** post for D+3-7 (e.g., "We built our own chart renderer in 600 lines to avoid letting LLMs touch ECharts config"). Reuse the same project URL.
- Post that deep-dive to HN, dev.to, Zenn, 掘金 — different audience, different angle.

### "It went viral" (HN front page #1, 1000+ stars in 24h)

- Disable issue auto-close. Triage every issue manually.
- Pin a "**we hear you, v0.3 priorities are forming**" issue. List the top 5 themes from feedback.
- Tweet a thank-you with a screenshot of the GitHub traffic graph.
- **Do not** rush a v0.3. Promise: "next minor in 4-6 weeks, based on this feedback."

### "Someone is hostile" (negative HN comment, troll thread, etc.)

- Reply to factual disagreements with technical answers and links to specs.
- Ignore bad-faith comments. Do not feed.
- If the criticism is valid (security hole, design flaw): **acknowledge it publicly within 1h**. Open a GitHub issue immediately. Don't get defensive.

### "Someone forks aggressively or copies"

- That's a sign of validation. Don't litigate.
- Track who's forking. Reach out to the most active forks — they may want to upstream changes.

### "Thariq / Anthropic / Simon Willison respond negatively"

- Vanishingly unlikely (AIO is additive to their discussion, not adversarial).
- If it happens, respond directly, professionally, and **publicly**. Treat as a feedback channel, not a fight.

---

## Pre-launch checklist (run on D-1)

- [ ] [Live demo](https://wxkingstar.github.io/ai-output-runtime/) loads in light + dark
- [ ] [CDN URL @v0.4.3](https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js) returns 200 with `CHART_TYPES` in body
- [ ] `npx skills add wxkingstar/ai-output-runtime -g -y` works in a fresh Claude Code session
- [ ] README in three languages all link to each other correctly
- [ ] All screenshots in `docs/screenshots/` are committed and accessible via GitHub raw URL
- [ ] [GitHub Release v0.2.0](https://github.com/wxkingstar/ai-output-runtime/releases/tag/v0.2.0) has highlights and CDN snippet
- [ ] Repository topics include `llm`, `agent-skill`, `structured-output`, `claude-code`, `chart`
- [ ] `launch-kit.md` is final — no `TODO`s, no placeholders
- [ ] You are awake and online at PT 00:01 on launch day (or have a trusted co-launcher in Pacific TZ)

---

## After this launch

This playbook is for v0.2 ("first real launch"). Subsequent releases (v0.3+) should be **smaller**, **less coordinated**, and aimed at the existing audience — release notes, X thread, Zhihu post. Don't relaunch on PH or HN.

The 6-week cadence: minor versions every 4-6 weeks, major launches **only when there is a genuinely new component family** or **a breaking change** (probably never for v0.x).
