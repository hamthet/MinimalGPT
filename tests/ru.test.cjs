'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const english = JSON.parse(read('_locales/en/messages.json'));
const russian = JSON.parse(read('_locales/ru/messages.json'));
const manifest = JSON.parse(read('manifest.json'));

test('Russian catalog matches all English keys and contains nonempty translations', () => {
  assert.deepEqual(Object.keys(russian).sort(), Object.keys(english).sort());
  for (const [key, entry] of Object.entries(russian)) {
    assert.equal(typeof entry.message, 'string', `${key}.message`);
    assert.ok(entry.message.trim(), `${key}.message`);
    assert.equal(typeof entry.description, 'string', `${key}.description`);
    assert.ok(entry.description.trim(), `${key}.description`);
  }
  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.version, '0.0.4');
});

test('Russian catalog and README explicitly disclose discontinued and unverified status', () => {
  assert.match(russian.extensionName.message, /разработка прекращена/i);
  assert.match(russian.extensionDescription.message, /требуется обновление/i);
  assert.match(russian.extensionDescription.message, /совместимость не проверена/i);
  assert.match(russian.discontinuedNotice.message, /разработка прекращена/i);
  assert.match(russian.discontinuedNotice.message, /требуется обновление/i);
  const readme = read('docs/README.ru.md');
  assert.match(readme, /Совместимость с текущим интерфейсом ChatGPT \*\*не проверена\*\*/i);
  assert.match(readme, /0\.0\.5.*отменено/i);
});

test('Alt+M displays Russian notices with the original OFF-first toggle and storage', () => {
  let mode;
  let toast;
  let keydown;
  const writes = [];
  const document = {
    documentElement: {
      setAttribute(name, value) { assert.equal(name, 'data-minimalgpt'); mode = value; },
      getAttribute(name) { assert.equal(name, 'data-minimalgpt'); return mode; }
    },
    body: { appendChild(node) { toast = node.textContent; } },
    getElementById() { return null; },
    createElement() { return { setAttribute() {}, remove() {} }; }
  };
  const chrome = {
    i18n: { getMessage(key) { return russian[key]?.message || ''; } },
    runtime: { lastError: undefined },
    storage: { local: {
      get(_defaults, callback) { callback({ minimalGPTEnabled: false }); },
      set(value) { writes.push(value.minimalGPTEnabled); }
    } }
  };
  const window = {
    addEventListener(name, callback) { assert.equal(name, 'keydown'); keydown = callback; },
    setTimeout() {}
  };
  vm.runInNewContext(read('content.js'), { chrome, document, window });
  assert.equal(mode, 'off');
  const toggle = () => keydown({
    key: 'm', altKey: true, ctrlKey: false, metaKey: false, shiftKey: false,
    repeat: false, isComposing: false, preventDefault() {}
  });
  toggle();
  assert.equal(mode, 'on');
  assert.equal(toast, `MinimalGPT: ${russian.statusOn.message} · ${russian.discontinuedNotice.message}`);
  toggle();
  assert.equal(mode, 'off');
  assert.equal(toast, `MinimalGPT: ${russian.statusOff.message} · ${russian.discontinuedNotice.message}`);
  assert.deepEqual(writes, [true, false]);
});
