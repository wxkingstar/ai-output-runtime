# Security Policy

AIO renders AI-authored data. Treat all AIO content as untrusted input.

## Supported Version

| Version | Supported |
|---|---|
| 0.4.x   | Yes       |
| 0.3.x   | Best-effort |
| ≤ 0.2.x | No        |

## Threat model — what AIO blocks

AI agents generate the data. The runtime renders it. The two sides are walled off so that an adversarial prompt cannot turn into an adversarial DOM. Concretely, AIO **does not support**:

- AI-generated HTML, CSS, or JavaScript.
- Inline event handlers (`onclick`, `onerror`, …).
- `iframe`, `object`, `embed`, `form` submission.
- `javascript:`, `data:`, or `file:` URLs.
- Dynamic schema loading.
- Custom components beyond the registry (`aio-registry.json`).

Every string field is checked twice — by the CLI at authoring time and by the runtime at render time — for forbidden characters (`<`, `>`). Unknown component blocks degrade to a visible JSON error, never to executed code.

## CDN supply-chain (Socket / Snyk "Medium" warnings)

External security audits (Socket, Snyk) currently flag the project at the **Medium** level because the recommended install is:

```html
<script src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js"></script>
```

The warning is correct: that's remote-code execution from a CDN, and we don't (yet) ship a Subresource Integrity hint in the recommended snippet. The threat model is real but mitigable. Three ways to harden:

### 1. Pin with Subresource Integrity (recommended)

```html
<script
  src="https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js"
  integrity="sha384-ErF6RdOMldak2ezoccku5XT1Awtb+N+srcc9WvWsqjPF9XQg0jC57nGW3IbHH6D/"
  crossorigin="anonymous"></script>
```

The hash above is the SHA-384 of `assets/ai-output-runtime.js` at tag `v0.4.3`. If jsDelivr ever serves different bytes, the browser refuses to execute. The hash never changes for a given tag; releasing a new tag means generating a new hash.

Verify the hash yourself:

```bash
curl -s 'https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js' \
  | openssl dgst -sha384 -binary | openssl base64 -A
# → ErF6RdOMldak2ezoccku5XT1Awtb+N+srcc9WvWsqjPF9XQg0jC57nGW3IbHH6D/
```

Lang modules in `assets/lang/*.js` are listed in `assets/lang/index.json` with their own SHA-384 hashes; the runtime currently fetches them via plain `<script>` injection without enforcing the hash. Strict deployments can pre-load the lang modules statically with `integrity=` and skip the lazy loader.

### 2. Inline the runtime — no CDN at all

The CLI's `--inline-runtime` flag embeds the runtime (and every used lang module) directly into the rendered HTML. The artifact opens via `file://` with zero network requests.

```bash
node SKILL_DIR/scripts/aio.mjs render report.md --inline-runtime --out report.html
```

For strict environments this is the easiest answer.

### 3. Self-host the runtime

If you don't trust jsDelivr at all, the runtime is one file you can serve yourself:

```bash
curl -sL 'https://cdn.jsdelivr.net/gh/wxkingstar/ai-output-runtime@v0.4.3/assets/ai-output-runtime.js' \
  > public/ai-output-runtime.v0.4.3.js
```

…then point your `<script src="">` at your own asset. The lang modules in `assets/lang/` are similarly portable.

## Why we don't sandbox in an iframe

We could render AIO in an iframe with `sandbox=""`. We chose not to because:
- The runtime never executes AI-authored code; the threat model already prevents script injection at the schema layer.
- iframes break print, accessibility tree, link anchors, and TOC scroll.

If you have a stronger threat model (e.g., rendering content from anonymous third parties), wrap the runtime container in an iframe with `sandbox="allow-same-origin"` and CSP `script-src 'self' https://cdn.jsdelivr.net 'sha384-…'` on top of the base policy.

## Reporting a vulnerability

Use **GitHub Security Advisories** on https://github.com/wxkingstar/ai-output-runtime (private disclosure path). For non-sensitive findings, a regular issue with the `security` label is fine.
