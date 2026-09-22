'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const english = JSON.parse(read('_locales/en/messages.json'));
const portuguese = JSON.parse(read('_locales/pt_BR/messages.json'));
const manifest = JSON.parse(read('manifest.json'));

// This suite tests only localization. It does not assert browser compatibility.
test('Brazilian Portuguese catalog matches the English key set and has descriptions', () => {
  assert.deepEqual(Object.keys(portuguese).sort(), Object.keys(english).sort());
  for (const [key, value] of Object.entries(portuguese)) {
    assert.equal(typeof value.message, 'string', `${key}.message`);
    assert.ok(value.message.trim(), `${key}.message must not be empty`);
    assert.equal(typeof value.description, 'string', `${key}.description`);
    assert.ok(value.description.trim(), `${key}.description must not be empty`);
  }
  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.version, '0.0.4');
});

test('Portuguese status and manifest retain an explicit discontinuation warning', () => {
  assert.match(portuguese.extensionName.message, /descontinuad/i);
  assert.match(portuguese.extensionDescription.message, /descontinuad/i);
  assert.match(portuguese.extensionDescription.message, /atualiza/i);
  assert.match(portuguese.extensionDescription.message, /compatibilidade não verificada/i);
  assert.match(portuguese.discontinuedNotice.message, /descontinuad/i);
  assert.match(portuguese.discontinuedNotice.message, /atualiza/i);
  assert.match(read('docs/README.pt-BR.md'), /compatibilidade com a interface atual do ChatGPT \*\*não foi verificada\*\*/i);
});

test('Alt+M shows Portuguese notices without changing the existing toggle behavior', () => {
  let mode;
  let notice;
  let onKeydown;
  const writes = [];
  const document = {
    documentElement: {
      setAttribute(name, value) { assert.equal(name, 'data-minimalgpt'); mode = value; },
      getAttribute(name) { assert.equal(name, 'data-minimalgpt'); return mode; }
    },
    body: { appendChild(node) { notice = node.textContent; } },
    getElementById() { return null; },
    createElement() { return { setAttribute() {}, remove() {} }; }
  };
  const chrome = {
    i18n: { getMessage(key) { return portuguese[key]?.message || ''; } },
    runtime: { lastError: undefined },
    storage: { local: {
      get(_defaults, callback) { callback({ minimalGPTEnabled: false }); },
      set(value) { writes.push(value); }
    } }
  };
  const window = {
    addEventListener(name, callback) { assert.equal(name, 'keydown'); onKeydown = callback; },
    setTimeout() {}
  };
  vm.runInNewContext(read('content.js'), { chrome, document, window });
  assert.equal(mode, 'off');
  const toggle = () => onKeydown({
    key: 'm', altKey: true, ctrlKey: false, metaKey: false, shiftKey: false,
    repeat: false, isComposing: false, preventDefault() {}
  });
  toggle();
  assert.equal(mode, 'on');
  assert.equal(notice, `MinimalGPT: ${portuguese.statusOn.message} · ${portuguese.discontinuedNotice.message}`);
  toggle();
  assert.equal(mode, 'off');
  assert.equal(notice, `MinimalGPT: ${portuguese.statusOff.message} · ${portuguese.discontinuedNotice.message}`);
  // Values cross a node:vm realm boundary, so compare the primitive preference, not object prototypes.
  assert.equal(writes.length, 2);
  assert.equal(writes[0].minimalGPTEnabled, true);
  assert.equal(writes[1].minimalGPTEnabled, false);
});
