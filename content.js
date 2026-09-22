(() => {
  'use strict';

  const STORAGE_KEY = 'minimalGPTEnabled';
  const ROOT_ATTRIBUTE = 'data-minimalgpt';
  const DEFAULT_ENABLED = false; // Unmaintained selectors must not modify a new installation by default.
  let changedLocally = false;

  function applyMode(enabled) {
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, enabled ? 'on' : 'off');
  }

  function showToast(enabled) {
    if (!document.body) return;

    document.getElementById('minimalgpt-toast')?.remove();
    const toast = document.createElement('div');
    toast.id = 'minimalgpt-toast';
    toast.textContent = `MinimalGPT: ${enabled ? 'ON' : 'OFF'} · discontinued / update required`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2400);
  }

  // Apply the safe state before the asynchronous preference read completes.
  applyMode(DEFAULT_ENABLED);

  try {
    chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_ENABLED }, (result) => {
      // An early keyboard toggle must win over a delayed storage callback.
      if (changedLocally || chrome.runtime.lastError) return;
      applyMode(result[STORAGE_KEY] === true);
    });
  } catch (_) {
    // Storage unavailable: leave the extension OFF and retain the local toggle.
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat || event.isComposing || !event.altKey || event.ctrlKey ||
        event.metaKey || event.shiftKey || event.key.toLowerCase() !== 'm') return;

    event.preventDefault();
    changedLocally = true;
    const enabled = document.documentElement.getAttribute(ROOT_ATTRIBUTE) !== 'on';
    applyMode(enabled);
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: enabled });
    } catch (_) {
      // The current tab can still be switched off if storage fails.
    }
    showToast(enabled);
  }, { capture: true });
})();
