# MinimalGPT

> [!WARNING]
> **Projeto descontinuado — necessita de atualização.** O autor relatou que a versão 0.0.3 funcionava anteriormente, mas deixou de funcionar em uma tentativa posterior. Na 0.0.4, apenas uma parte dos ícones de compartilhamento foi ocultada; a barra lateral e outras ações continuaram visíveis. A 0.0.5 tenta corrigir os seletores, mas **não foi validada na interface atual do ChatGPT**. Este repositório é disponibilizado como código de referência, sem manutenção ativa ou garantia de funcionamento.
>
> **Discontinued — update required.** The author reported that 0.0.3 worked previously but failed on a later attempt. Version 0.0.4 also failed to hide the sidebar and several chat/message controls. Version 0.0.5 attempts a selector repair, but **has not been verified against the current ChatGPT interface**. This repository is reference code, not a supported or ready-to-use extension.

MinimalGPT is an experimental Chromium Manifest V3 extension that reduces visual clutter in ChatGPT without replacing the underlying application. It is designed for **one conversation per browser tab**.

## Project status

**Discontinued / unmaintained.** ChatGPT's private DOM can change independently of the extension. The cause and full scope of the current incompatibility have not been established. Version 0.0.5 is a **regression-repair candidate**, not a verified compatibility release. No updates, compatibility, or support are guaranteed. No official affiliation with OpenAI or ChatGPT is claimed.

If a page is missing controls or looks broken, press `Alt+M` to disable MinimalGPT and reload the ChatGPT tab. If the shortcut fails, disable or remove the extension at `chrome://extensions/` and reload. Do not rely on this project for critical workflows.

## Intended behavior

When manually enabled, the CSS-first profile attempts to hide the sidebar (including known compact-sidebar variants), top chat header, Share, selected voice/dictation controls, and non-Copy response-action buttons. It retains typing, attachments, Send and Copy, reduces composer shadows, and adjusts reading width where recognizable. The exact result depends on ChatGPT's current DOM and locale. Unrecognized controls remain visible rather than risking removal of unrelated functionality.

MinimalGPT does not intercept requests, access account credentials, load remote code, or install a DOM observer. It requests only Chromium's `storage` permission. It runs only on `https://chatgpt.com/*` and saves one local ON/OFF preference. Review the source before installing an unmaintained extension.

## Files

- `manifest.json` — extension configuration and permissions.
- `minimal.css` — opt-in presentation rules, including selector fallbacks.
- `content.js` — local preference, `Alt+M` toggle and short status notice.
- `tests/` — dependency-free static and content-script smoke tests (not live-browser compatibility tests).
- `.github/workflows/smoke.yml` — smoke tests for changes and pull requests.

## Install for local inspection (at your own risk)

1. Download or clone the repository and inspect its contents.
2. Open `chrome://extensions/` in Chromium, enable **Developer mode**, then select **Load unpacked**.
3. Select the folder containing `manifest.json`.
4. Reload `https://chatgpt.com/`. A new installation starts **OFF**; press `Alt+M` to opt in.
5. After updating the source, **reload the extension** at `chrome://extensions/` and **reload the ChatGPT tab**. Updating the repository alone does not update an installed unpacked extension.

The local preference persists across reloads; installations that already saved `ON` stay enabled until explicitly turned off. Browser or site shortcuts may conflict with `Alt+M`.

## Checks and limitations

Run `node --test tests/*.test.cjs` with Node.js 22. The tests verify the manifest, selector presence, CSS safety guards and mocked toggle/storage behavior. **They cannot establish that any selector matches your live ChatGPT page.** A screenshot of the UI likewise cannot establish the element IDs or accessible names. Manual testing in an installed browser is required before claiming compatibility.

If controls still remain visible after updating, inspect their actual elements in Chrome DevTools and record only the relevant element tag, `id`, `data-testid`, `aria-label` and immediate parent structure (not conversation text, account data, cookies or tokens). The sidebar, top header, message action bar and composer may have different identifiers in different UI variants or languages. Do not paste a complete page HTML dump or private chat content into a public issue.

Avoid blanket rules such as hiding every `header` or `aside`, every message button, or arbitrary elements merely because a test ID contains `audio`. The selector fallback for `-turn-action-button` intentionally keeps `copy` actions; actions with an entirely different structure require separate validation.

## Version history

- **0.0.5 (2026-09-22):** regression-repair candidate after the 0.0.4 failure report; restores limited fallbacks for alternate sidebar and header structures, restricts non-Copy action hiding to response-action IDs, and broadens recognized composer forms. **Not verified in a live browser.**
- **0.0.4 (2026-09-22):** archival safety revision with opt-in defaults and narrower CSS. A later author report indicated that most of the intended minimal UI no longer applied.
- **0.0.3 (2026-08-27):** selector updates for voice/dictation and response actions; the author reports it worked previously and failed later.
- **0.0.2:** single-conversation low-clutter profile and reduced motion.
- **0.0.1:** initial Manifest V3 extension, `Alt+M` toggle and local persistence.

No open-source license has been granted in this repository. Public visibility alone does not grant permission to redistribute or modify the code; the author may choose a license separately.
