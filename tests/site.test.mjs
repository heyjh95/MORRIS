import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { escapeHtml, renderPage } from "../scripts/build-html.mjs";

const read = (path) => readFileSync(resolve(path), "utf8");
const site = JSON.parse(read("data/site.json"));
const pages = [["ko", "html/index.html"], ["en", "html/en.html"]];

test("Checked-in pages match the shared templates and language data", () => {
  for (const [language, path] of pages) {
    assert.equal(read(path), renderPage(language), path + ": run npm run build:html");
    assert.doesNotMatch(read(path), /href=""|undefined|\{\{\{?\w+/);
  }
});

test("IDs, ARIA references, fragment links, images and CSS paths resolve", () => {
  for (const [, path] of pages) {
    const html = read(path);
    const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, path + ": duplicate ID");
    for (const [, references] of html.matchAll(/\baria-(?:controls|labelledby)="([^"]+)"/g)) {
      for (const id of references.split(/\s+/)) assert.ok(ids.includes(id), path + ": missing " + id);
    }
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(ids.includes(id), path + ": missing fragment " + id);
    }
    for (const [, asset] of html.matchAll(/(?:src|href)="(\.\.?\/[^"]+)"/g)) {
      assert.ok(existsSync(resolve(dirname(path), asset)), path + ": missing " + asset);
    }
    assert.ok(html.includes('href="../css/layout.min.css"'));
    // 상세 링크를 슬라이드 선택 버튼 안에 넣지 않는다.
    for (const [, content] of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) {
      assert.doesNotMatch(content, /<a\b/);
    }
  }
});

test("Category buttons and panels are generated from the same records", () => {
  for (const [, path] of pages) {
    const html = read(path);
    const controls = Array.from(html.matchAll(/aria-controls="panel-([^"]+)"/g), (m) => m[1]);
    assert.deepEqual(controls, site.categories.map((item) => item.id));
    const selected = html.match(/aria-pressed="true"/g) || [];
    assert.equal(selected.length, 1, path);
    for (const item of site.categories) {
      assert.ok(html.includes('id="panel-' + item.id + '"'));
      assert.ok(html.includes('id="heading-' + item.id + '"'));
    }
  }
});

test("Primary menu and drawer use the same links and translations", () => {
  for (const [language, path] of pages) {
    const html = read(path);
    const text = JSON.parse(read("data/" + language + ".json"));
    for (const item of site.navigation) {
      const label = escapeHtml(text.navigation[item.key]);
      for (const cls of ["gnb__link", "header__drawer-link"]) {
        assert.ok(html.includes('class="' + cls + '" href="' + item.href + '">' + label + "</a>"));
      }
    }
  }
});

test("Every brand radio has a panel and a CSS visibility rule", () => {
  const css = read("css/layout.css");
  for (const [, path] of pages) {
    const html = read(path);
    for (const brand of site.brands) {
      assert.ok(html.includes('id="brand-' + brand.id + '"'));
      assert.ok(html.includes('brands__panel--' + brand.id + '"'));
      assert.ok(css.includes(".brands:has(#brand-" + brand.id + ":checked) .brands__panel--" + brand.id));
    }
  }
});

test("Text escaping preserves text without inserting HTML or attributes", () => {
  assert.equal(escapeHtml('<a title="x">&\'</a>'), "&lt;a title=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
});
