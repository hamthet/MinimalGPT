# MinimalGPT

> [!WARNING]
> **Discontinued — update required.** The author reports that version 0.0.3 worked previously but did not work on a later attempt. Version 0.0.4 is an archival safety revision, **not a verified compatibility update**. Compatibility with the current ChatGPT interface has **not been verified**. This repository is reference code, not a supported, ready-to-use extension.

**English** · [Português (Brasil)](docs/README.pt-BR.md) · [Español](docs/README.es.md) · [Русский](docs/README.ru.md)

MinimalGPT is an experimental Chromium Manifest V3 extension that reduces visual clutter in ChatGPT without replacing the underlying application. It is designed for **one conversation per browser tab**.

## Project status

**Discontinued / unmaintained.** The last known working state is the author's earlier use of version 0.0.3; the cause and scope of the subsequently reported failure are unknown. The author subsequently reported that version 0.0.4 did not hide most of the intended chat controls. ChatGPT's interface changes independently of this extension, so selectors may become obsolete. Version 0.0.4 is an **archival safety revision**, not a verified compatibility release. It limits collateral UI damage and starts new installations OFF. There is no guarantee of updates, compatibility, or support. No official affiliation with OpenAI or ChatGPT is claimed.

If a page is missing controls or looks broken, turn MinimalGPT off with `Alt+M`, then reload the ChatGPT tab. If the shortcut fails, disable or remove the extension at `chrome://extensions/` and reload the page. Do not rely on this project for critical workflows.

## Intended behavior

When manually enabled, the CSS-first profile attempts to hide identifiable sidebar and top-bar controls, Share and selected voice/dictation controls, and selected response actions; it retains the composer, attachments, sending and copying. It also reduces composer shadows and adjusts reading width where identifiable. The exact result depends on ChatGPT's current DOM and locale. Some controls may remain visible when their identifiers change; this is preferable to removing unrelated features.

MinimalGPT does not intercept requests, access account credentials, load remote code, or install a DOM observer. It requests only Chromium's `storage` permission. The extension runs only on `https://chatgpt.com/*` and stores one local ON/OFF preference. Read the small source files before installing an unmaintained extension.

## Files

- `manifest.json` — extension configuration, default locale, and permissions.
- `_locales/en/messages.json` — English extension name, description, and status messages.
- `_locales/pt_BR/messages.json` — Brazilian Portuguese extension name, description, and status messages.
- `_locales/es/messages.json` — Spanish extension name, description, and status messages.
- `_locales/ru/messages.json` — Russian extension name, description, and status messages.
- `docs/README.pt-BR.md` — complete Brazilian Portuguese documentation.
- `docs/README.es.md` — complete Spanish documentation.
- `docs/README.ru.md` — complete Russian documentation.
- `minimal.css` — opt-in presentation rules; unchanged by localization.
- `content.js` — local preference, `Alt+M` toggle, and localized status notice.
- `tests/` — dependency-free static and content-script smoke tests (not live-browser compatibility tests).
- `.github/workflows/smoke.yml` — smoke-test automation on changes and pull requests.

## Languages

**English (`en`) is the default; Brazilian Portuguese (`pt_BR`), Spanish (`es`), and Russian (`ru`) are also available.** Chrome selects the available locale from the browser language and falls back to English where a matching translation is unavailable. Simplified Chinese (`zh_CN`) is planned but is not yet shipped. The ChatGPT website's language is independent of the extension's language; localizing the status notice does not update the website's CSS selectors or restore compatibility.

This README is in English. The [Brazilian Portuguese documentation](docs/README.pt-BR.md), [Spanish documentation](docs/README.es.md), and [Russian documentation](docs/README.ru.md) are complete translations. Other language-specific READMEs will be added only when their translations are completed.

## Install for local inspection (at your own risk)

1. Download or clone this repository and inspect its contents.
2. In Chromium, open `chrome://extensions/`, enable **Developer mode**, and select **Load unpacked**.
3. Select the folder containing `manifest.json`.
4. Reload `https://chatgpt.com/`. A new installation starts **OFF** for safety; press `Alt+M` to opt in.
5. To apply source changes, reload the extension at `chrome://extensions/` and then reload the ChatGPT tab.

The local preference persists across reloads; installations that already saved `ON` remain enabled until explicitly turned off. Browser or website shortcuts may conflict with `Alt+M`. If the shortcut cannot be used, disable the extension in Chromium's extensions page.

## Checks and limitations

Run `node --test tests/*.test.cjs` with Node.js 22 for local smoke checks. These validate the manifest, available localization keys, static CSS safeguards, and mocked toggle/storage behavior, but **cannot verify the current ChatGPT interface, accessibility, or end-to-end behavior**. Manual browser testing would be required before describing a build as compatible.

Known limitations: the extension relies on private, undocumented ChatGPT DOM attributes; features, languages, and layouts vary; no automatic compatibility detection or self-repair is implemented. Avoid adding broad rules such as hiding every `header`, hiding all non-Copy controls indiscriminately, or hiding arbitrary elements merely because their test ID contains `audio`.

## Version history

- **0.0.4 (2026-09-22):** archival safety revision: discontinuation warnings, opt-in default for new installations, conservative CSS selectors, and smoke tests. **Current ChatGPT compatibility remains unverified.** The author's later report indicates that most of the intended UI changes did not work. An unrequested 0.0.5 selector patch was reverted; the 0.0.4 source is the baseline for localization.
- **0.0.3 (2026-08-27):** selector updates for voice/dictation and response actions; last version the author reports previously worked, with a later failure reported.
- **0.0.2:** single-conversation low-clutter profile and reduced movement.
- **0.0.1:** initial Manifest V3 extension, `Alt+M` toggle, and local persistence.

No open-source license has been granted in this repository; public visibility alone does not grant permission to redistribute or modify the code. The author may choose a license separately.
