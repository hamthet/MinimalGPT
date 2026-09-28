# AGENTS.md

Operational guidance for AI agents and maintainers working in this repository.

## Repository status

MinimalGPT is a **discontinued, archival Chromium Manifest V3 extension**. The current baseline is version **0.0.4**. Compatibility with the live ChatGPT interface is **not verified**.

Preserve the archival safety posture unless a task explicitly changes project status:

- new installations start OFF;
- selectors should fail open rather than hide unrelated UI;
- no network interception or remote code;
- no background/service worker;
- no DOM observer or polling loop;
- only Chromium `storage` permission;
- do not claim live compatibility from static tests.

## Mental model

Runtime flow:

1. `manifest.json` injects `minimal.css` and `content.js` at `document_start` on `https://chatgpt.com/*`.
2. `content.js` immediately sets `html[data-minimalgpt="off"]`.
3. It reads `chrome.storage.local.minimalGPTEnabled`.
4. `Alt+M` toggles `data-minimalgpt`, persists the preference, and shows a localized status toast.
5. `minimal.css` changes the page only while `html[data-minimalgpt="on"]` is present.

There is no backend, database, build step, package manager, network client, or runtime dependency outside Chromium APIs.

## Repository map

- `manifest.json` — extension scope, permissions, locale, injected files, version.
- `content.js` — OFF-first state, persisted preference, keyboard toggle, localized toast.
- `minimal.css` — opt-in visual rules and selector safety boundaries.
- `_locales/*/messages.json` — Chromium i18n catalogs.
- `README.md` — canonical English project documentation.
- `docs/README.*.md` — complete translated documentation.
- `tests/smoke.test.cjs` — runtime-contract, manifest, CSS-safety, and English-message checks.
- `tests/*-*.test.cjs`, `tests/es.test.cjs`, `tests/ru.test.cjs` — locale parity and localized toggle checks.
- `.github/workflows/smoke.yml` — Node.js 22 smoke-test CI.

## Development commands

No install or build step is required.

Required local automated validation:

```bash
node --test tests/*.test.cjs
```

Use Node.js 22 to match CI.

For live-browser checks, load the repository as an unpacked Chromium extension from `chrome://extensions/`, reload the extension after source changes, then reload the ChatGPT tab.

## Change surfaces and coupled files

When changing `manifest.json`:

- re-run the full test suite;
- update tests that intentionally pin permissions, host scope, locale, or version;
- update README translations if user-visible behavior, support status, or version history changes.

When changing `content.js`:

- preserve the OFF-first state unless explicitly instructed otherwise;
- preserve the rule that an early local toggle wins over a delayed storage callback;
- update `tests/smoke.test.cjs` and affected locale tests.

When changing `minimal.css`:

- prefer narrow selectors tied to known controls;
- keep every visual rule gated behind `html[data-minimalgpt="on"]`;
- update static safety tests when a selector policy intentionally changes;
- perform live-browser validation before making compatibility claims.

When adding or changing i18n keys:

- update all five catalogs: `en`, `pt_BR`, `es`, `ru`, `zh_CN`;
- retain nonempty translator descriptions;
- update relevant tests and translated documentation when wording changes materially.

When changing project status, behavior, or release history:

- keep `README.md` and all translated READMEs semantically aligned;
- do not silently remove the discontinued/unverified warning unless the project has actually resumed maintenance and compatibility has been validated.

## Safety guardrails

Do not introduce broad UI suppression merely to make selectors work again. In particular, avoid:

- blanket rules that hide generic `header`, `nav`, or `main` structures;
- substring selectors that hide arbitrary controls because a test ID contains terms such as `audio`, `voice`, or `more`;
- rules that hide all response actions except one;
- new permissions, network interception, remote scripts, DOM polling, or observers without an explicit task and a concrete justification.

The preferred failure mode is: **an intended control remains visible**. Hiding unrelated or essential ChatGPT UI is a worse regression.

## Validation levels

### Required for every source change

```bash
node --test tests/*.test.cjs
```

### Required before claiming current ChatGPT compatibility

Manual Chromium verification is necessary. Check at minimum:

1. a fresh installation remains OFF;
2. `Alt+M` toggles ON and OFF;
3. intended controls are hidden only when ON;
4. composer, attachments, sending, and copying remain usable;
5. turning the extension OFF and reloading restores the normal interface;
6. relevant locale-dependent selectors are checked when they are part of the change.

Static tests do **not** validate the live ChatGPT DOM, accessibility, or end-to-end compatibility.

## Definition of Done

A task is complete only when all applicable conditions are true:

- the full Node test suite passes;
- the change is limited to the task's actual scope;
- no new permission or external dependency was added without need;
- OFF-first and fail-open safety properties remain intact unless explicitly changed;
- coupled locale/tests/docs files are synchronized;
- no generated or temporary artifacts were added;
- compatibility claims are limited to what was actually tested;
- any unverified live-browser behavior is stated as unverified.

Keep this file operational and concise. The README explains the project; this file explains how to modify it safely.
