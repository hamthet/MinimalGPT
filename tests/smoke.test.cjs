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

function harness({ stored, delayed = false, storageError = false } = {}) {
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

test('manifest is narrowly scoped and accurately identifies archival status', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.content_scripts[0].matches, ['https://chatgpt.com/*']);
  assert.match(manifest.name, /discontinued/i);
  assert.equal(manifest.version, '0.0.5');
});

test('CSS is opt-in and avoids known dangerous blanket selectors', () => {
  assert.match(css, /html\[data-minimalgpt="on"\]/);
  assert.doesNotMatch(css, /html\[data-minimalgpt="on"\]\s+header\s*[,\{]/);
  assert.doesNotMatch(css, /\[data-testid\*="(?:audio|voice|more)"/);
  assert.doesNotMatch(css, /html\[data-minimalgpt="on"\]\s+main\s*\{/);
  assert.match(css, /#minimalgpt-toast/);
});

test('sidebar and top chrome cover alternate shells without blanketing page elements', () => {
  for (const hook of [
    '#stage-slideover-sidebar', '#stage-sidebar-tiny-bar', '#sidebar',
    '#page-header', '[data-testid="chat-header"]',
    'aside:has(nav[aria-label*="chat history" i])'
  ]) assert.ok(css.includes(hook), `Missing selector fallback: ${hook}`);
  assert.doesNotMatch(css, /html\[data-minimalgpt="on"\]\s+(?:aside|nav|header)\s*[,\{]/);
});

test('turn actions leave Copy and composer controls available', () => {
  assert.match(css, /button\[data-testid\$="-turn-action-button"\]:not\(\[data-testid\*="copy" i\]\)/);
  assert.doesNotMatch(css, /\[data-testid\$="-action-buttons"\][^\n]*display:\s*none/i);
  assert.doesNotMatch(css, /button\[data-testid\*="copy"[^\n]*display:\s*none/i);
  assert.match(css, /form\[data-type="unified-composer"\]/);
  assert.doesNotMatch(css, /\[data-testid\*="(?:audio|upload|attachment|send)"/);
});
