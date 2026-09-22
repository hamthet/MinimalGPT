'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const english = JSON.parse(read('_locales/en/messages.json'));
const spanish = JSON.parse(read('_locales/es/messages.json'));
const manifest = JSON.parse(read('manifest.json'));

test('Spanish catalog has the same nonempty keys and translator descriptions as English', () => {
  assert.deepEqual(Object.keys(spanish).sort(), Object.keys(english).sort());
  for (const [key, value] of Object.entries(spanish)) {
    assert.equal(typeof value.message, 'string', `${key}.message`);
    assert.ok(value.message.trim(), `${key}.message cannot be empty`);
    assert.equal(typeof value.description, 'string', `${key}.description`);
    assert.ok(value.description.trim(), `${key}.description cannot be empty`);
  }
  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.version, '0.0.4');
});

test('Spanish extension messages and README clearly state discontinued and update required', () => {
  assert.match(spanish.extensionName.message, /descontinuad/i);
  assert.match(spanish.extensionDescription.message, /descontinuad/i);
  assert.match(spanish.extensionDescription.message, /actualizaci[oó]n/i);
  assert.match(spanish.extensionDescription.message, /compatibilidad no verificada/i);
  assert.match(spanish.discontinuedNotice.message, /descontinuad/i);
  assert.match(spanish.discontinuedNotice.message, /actualizaci[oó]n/i);
  assert.match(read('docs/README.es.md'), /compatibilidad con la interfaz actual de ChatGPT \*\*no se ha verificado\*\*/i);
});

test('Alt+M uses the Spanish messages without altering storage or initial OFF behavior', () => {
  let mode;
  let toastText;
  let onKeydown;
  const writes = [];
  const document = {
    documentElement: {
      setAttribute(name, value) { assert.equal(name, 'data-minimalgpt'); mode = value; },
      getAttribute(name) { assert.equal(name, 'data-minimalgpt'); return mode; }
    },
    body: { appendChild(node) { toastText = node.textContent; } },
    getElementById() { return null; },
    createElement() { return { setAttribute() {}, remove() {} }; }
  };
  const chrome = {
    i18n: { getMessage(key) { return spanish[key]?.message || ''; } },
    runtime: { lastError: undefined },
    storage: { local: {
      get(_defaults, callback) { callback({ minimalGPTEnabled: false }); },
      set(value) { writes.push(value.minimalGPTEnabled); }
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
  assert.equal(toastText, `MinimalGPT: ${spanish.statusOn.message} · ${spanish.discontinuedNotice.message}`);
  toggle();
  assert.equal(mode, 'off');
  assert.equal(toastText, `MinimalGPT: ${spanish.statusOff.message} · ${spanish.discontinuedNotice.message}`);
  assert.deepEqual(writes, [true, false]);
});
