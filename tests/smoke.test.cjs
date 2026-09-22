'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'content.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'minimal.css'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const english = JSON.parse(fs.readFileSync(path.join(root, '_locales/en/messages.json'), 'utf8'));

function harness({ stored, delayed = false, storageError = false, messages = english } = {}) {
  const attributes = new Map();
  const listeners = new Map();
  const writes = [];
  const timers = [];
  let storageCallback;
  let toast;
  const document = {
    documentElement: {
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.get(name) ?? null; }
    },
    body: {
      appendChild(node) { toast = node; }
    },
    getElementById(id) { return id === 'minimalgpt-toast' ? toast : null; },
    createElement() {
      return {
        setAttribute() {},
        remove() { if (toast === this) toast = null; }
      };
    }
  };
  const chrome = {
    i18n: { getMessage(key) { return messages[key]?.message || ''; } },
    runtime: { lastError: storageError ? { message: 'unavailable' } : undefined },
    storage: { local: {
      get(_defaults, callback) {
        storageCallback = () => callback({ minimalGPTEnabled: stored });
        if (!delayed) storageCallback();
      },
      set(value) { writes.push(value); }
    } }
  };
  const window = {
    addEventListener(name, callback) { listeners.set(name, callback); },
    setTimeout(callback) { timers.push(callback); }
  };
  vm.runInNewContext(script, { chrome, document, window });
  return {
    mode: () => attributes.get('data-minimalgpt'),
    toast: () => toast,
    writes,
    timers,
    resolveStorage: () => storageCallback(),
    key(overrides = {}) {
      const event = {
        key: 'm', altKey: true, ctrlKey: false, metaKey: false,
        shiftKey: false, repeat: false, isComposing: false,
        prevented: false,
        preventDefault() { this.prevented = true; },
        ...overrides
      };
      listeners.get('keydown')(event);
      return event;
    }
  };
}

test('fresh installation stays OFF until deliberately enabled', () => {
  const app = harness();
  assert.equal(app.mode(), 'off');
  assert.equal(app.key().prevented, true);
  assert.equal(app.mode(), 'on');
  assert.equal(app.writes.length, 1);
  assert.equal(app.writes[0].minimalGPTEnabled, true);
  assert.match(app.toast().textContent, /discontinued \/ update required/);
  app.key();
  assert.equal(app.mode(), 'off');
});

test('previously stored true is retained; non-boolean values fail closed', () => {
  assert.equal(harness({ stored: true }).mode(), 'on');
  assert.equal(harness({ stored: 'true' }).mode(), 'off');
  assert.equal(harness({ stored: null }).mode(), 'off');
});

test('late storage read cannot undo a local toggle', () => {
  const app = harness({ stored: true, delayed: true });
  assert.equal(app.mode(), 'off');
  app.key();
  app.resolveStorage();
  assert.equal(app.mode(), 'on');
  app.key();
  assert.equal(app.mode(), 'off');
});

test('storage errors leave the extension OFF', () => {
  assert.equal(harness({ stored: true, storageError: true }).mode(), 'off');
});

test('unrelated keys, repeat, IME and modified shortcuts are untouched', () => {
  const app = harness();
  for (const overrides of [
    { altKey: false }, { ctrlKey: true }, { shiftKey: true },
    { metaKey: true }, { repeat: true }, { isComposing: true }, { key: 'x' }
  ]) {
    assert.equal(app.key(overrides).prevented, false);
    assert.equal(app.mode(), 'off');
  }
  assert.equal(app.writes.length, 0);
});

test('manifest is narrowly scoped and identifies archival status through the English catalog', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.content_scripts[0].matches, ['https://chatgpt.com/*']);
  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.name, '__MSG_extensionName__');
  assert.equal(manifest.description, '__MSG_extensionDescription__');
  assert.match(english.extensionName.message, /discontinued/i);
  assert.match(english.extensionDescription.message, /compatibility unverified/i);
  assert.equal(manifest.version, '0.0.4');
});

test('English catalog has complete, nonempty messages for every user-facing string', () => {
  for (const key of [
    'extensionName', 'extensionDescription', 'statusOn', 'statusOff', 'discontinuedNotice'
  ]) {
    assert.equal(typeof english[key]?.message, 'string', key);
    assert.ok(english[key].message.trim(), key);
    assert.ok(english[key].description?.trim(), `${key} translator description`);
  }
});

test('status notice uses localized messages and falls back to English for missing keys', () => {
  const localized = harness({ messages: {
    statusOn: { message: 'ENABLED' },
    statusOff: { message: 'DISABLED' },
    discontinuedNotice: { message: 'no longer maintained' }
  } });
  localized.key();
  assert.equal(localized.toast().textContent, 'MinimalGPT: ENABLED · no longer maintained');
  localized.key();
  assert.equal(localized.toast().textContent, 'MinimalGPT: DISABLED · no longer maintained');

  const fallback = harness({ messages: {} });
  fallback.key();
  assert.equal(fallback.toast().textContent, 'MinimalGPT: ON · discontinued / update required');
});

test('CSS is opt-in and avoids known dangerous blanket selectors', () => {
  assert.match(css, /html\[data-minimalgpt="on"\]/);
  assert.doesNotMatch(css, /html\[data-minimalgpt="on"\]\s+header\s*[,\{]/);
  assert.doesNotMatch(css, /\[data-testid\*="(?:audio|voice|more)"/);
  assert.doesNotMatch(css, /turn-action-button[^\n]*:not\(/);
  assert.doesNotMatch(css, /html\[data-minimalgpt="on"\]\s+main\s*\{/);
  assert.match(css, /#minimalgpt-toast/);
});
