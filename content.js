(() => {
  'use strict';

  const STORAGE_KEY = 'minimalGPTEnabled';
  const ROOT_ATTRIBUTE = 'data-minimalgpt';
  const DEFAULT_ENABLED = true;

  function applyMode(enabled) {
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, enabled ? 'on' : 'off');
  }

  function showToast(enabled) {
    if (!document.body) return;

    const previous = document.getElementById('minimalgpt-toast');
    if (previous) previous.remove();

    const toast = document.createElement('div');
    toast.id = 'minimalgpt-toast';
    toast.textContent = `MinimalGPT: ${enabled ? 'ON' : 'OFF'}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    window.setTimeout(() => toast.remove(), 1100);
  }

  function readInitialState() {
    chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_ENABLED }, (result) => {
      applyMode(Boolean(result[STORAGE_KEY]));
    });
  }

  function toggleMode() {
    const enabled = document.documentElement.getAttribute(ROOT_ATTRIBUTE) !== 'on';
    applyMode(enabled);
    chrome.storage.local.set({ [STORAGE_KEY]: enabled });
    showToast(enabled);
  }

  // Apply a minimal state immediately to reduce layout flash while storage loads.
  applyMode(DEFAULT_ENABLED);
  readInitialState();

  window.addEventListener('keydown', (event) => {
    if (event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'm') {
      event.preventDefault();
      toggleMode();
    }
  }, { capture: true });
})();
