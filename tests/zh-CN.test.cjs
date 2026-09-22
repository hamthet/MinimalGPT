'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const locale = (name) => JSON.parse(read(`_locales/${name}/messages.json`));
const english = locale('en');
const chinese = locale('zh_CN');
const manifest = JSON.parse(read('manifest.json'));

// Translation tests only: they do not establish compatibility with the live ChatGPT DOM.
test('all five completed catalogs share the full English key set and nonempty messages', () => {
  const keys = Object.keys(english).sort();
  for (const name of ['en', 'pt_BR', 'es', 'ru', 'zh_CN']) {
    const catalog = locale(name);
    assert.deepEqual(Object.keys(catalog).sort(), keys, `${name} key parity`);
    for (const key of keys) {
      assert.ok(catalog[key].message?.trim(), `${name}.${key}.message`);
      assert.ok(catalog[key].description?.trim(), `${name}.${key}.description`);
    }
  }
  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.version, '0.0.4');
});

test('Simplified Chinese name, description, notice and README retain the archival warning', () => {
  assert.match(chinese.extensionName.message, /停止维护/);
  assert.match(chinese.extensionDescription.message, /停止维护/);
  assert.match(chinese.extensionDescription.message, /需要更新/);
  assert.match(chinese.extensionDescription.message, /兼容性未经验证/);
  assert.match(chinese.discontinuedNotice.message, /停止维护/);
  assert.match(chinese.discontinuedNotice.message, /需要更新/);
  const readme = read('docs/README.zh-CN.md');
  assert.match(readme, /兼容性\*\*尚未验证\*\*/);
  assert.match(readme, /0\.0\.5.*已经撤销/);
});

test('Alt+M uses Simplified Chinese notices with the original OFF-first toggle and storage', () => {
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
    i18n: { getMessage(key) { return chinese[key]?.message || ''; } },
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
  assert.equal(toast, `MinimalGPT: ${chinese.statusOn.message} · ${chinese.discontinuedNotice.message}`);
  toggle();
  assert.equal(mode, 'off');
  assert.equal(toast, `MinimalGPT: ${chinese.statusOff.message} · ${chinese.discontinuedNotice.message}`);
  assert.deepEqual(writes, [true, false]);
});

test('five README language navigation bars point to existing documentation', () => {
  const pages = ['README.md', 'docs/README.pt-BR.md', 'docs/README.es.md', 'docs/README.ru.md', 'docs/README.zh-CN.md'];
  for (const page of pages) {
    const content = read(page);
    for (const label of ['English', 'Português (Brasil)', 'Español', 'Русский', '简体中文']) {
      assert.ok(content.includes(label), `${page}: ${label}`);
    }
    assert.ok(content.includes('0.0.4'), `${page}: version history`);
  }
});
