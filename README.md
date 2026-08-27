# MinimalGPT

MinimalGPT is a small Chromium extension that reduces visual clutter in ChatGPT while leaving the underlying ChatGPT application intact.

## Version 0.0.2

This profile assumes **one conversation per browser tab**.

Minimal mode:

- hides conversation navigation and top chrome when identifiable;
- hides Share and overflow controls;
- removes microphone and voice-mode controls;
- keeps attachments and text-composition tools;
- reduces response actions to Copy when identifiable;
- removes UI transitions and decorative composer shadows;
- normalizes reading width and line-height;
- toggles with `Alt+M` and stores the local ON/OFF state.

## Files

- `manifest.json` — Manifest V3 configuration.
- `minimal.css` — visual simplification layer.
- `content.js` — toggle state, persistence, shortcut and status toast.

The current version remains CSS-first and does not use DOM polling or `MutationObserver`.

## Local installation

1. Clone or download this repository.
2. Open the browser extensions page.
3. Enable Developer mode.
4. Choose **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. Open or reload `https://chatgpt.com/`.

After updating the repository, reload the extension and then reload the ChatGPT tab.

## Interaction target

`read → type → send → read → copy`

## Changelog

### 0.0.2

- single-conversation low-clutter profile;
- Share and overflow controls removed where identifiable;
- microphone and voice controls removed;
- response actions reduced to Copy where identifiable;
- reduced motion and decorative elevation;
- normalized reading width and rhythm.

### 0.0.1

- initial Manifest V3 extension;
- `Alt+M` toggle and local persistence;
- basic sidebar/header hiding and conversation-width adjustments.
