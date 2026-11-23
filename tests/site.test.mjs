import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const read = (path) => readFileSync(resolve(path), "utf8");
const pages = ["html/index.html", "html/en.html"];

test("IDs, ARIA references, fragment links and local assets resolve", () => {
  for (const path of pages) {
    const html = read(path);
    const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), m => m[1]);
    assert.equal(new Set(ids).size, ids.length, path + ": duplicate ID");
    for (const [, references] of html.matchAll(/\baria-(?:controls|labelledby)="([^"]+)"/g)) {
      for (const id of references.split(/\s+/)) assert.ok(ids.includes(id), path + ": missing " + id);
    }
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(ids.includes(id), path + ": missing fragment " + id);
    }
    for (const [, asset] of html.matchAll(/(?:src|href)="(\.\.?\/[^"#]+)"/g)) {
      assert.ok(existsSync(resolve(dirname(path), asset)), path + ": missing " + asset);
    }
    assert.doesNotMatch(html, /href=""|\{\{\{?\w+/);
    for (const [, content] of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) {
      assert.doesNotMatch(content, /<a\b/, path + ": nested link in button");
    }
  }
});

test("Slide buttons and panels are paired by ID with one initial selection", () => {
  const groups = [
    ["main-visual__select", "main-visual__slide"],
    ["product-categories__button", "product-categories__panel"],
    ["brands__tab", "brands__panel"],
  ];
  for (const path of pages) {
    const html = read(path);
    for (const [buttonClass, panelClass] of groups) {
      const buttons = Array.from(html.matchAll(new RegExp('<button[^>]*class="' + buttonClass + '"[^>]*>', "g")), m => m[0]);
      const panels = Array.from(html.matchAll(new RegExp('<(?:li|section|article) class="' + panelClass + ' swiper-slide"[^>]*id="([^"]+)"', "g")), m => m[1]);
      assert.ok(panels.length > 0, path + ": no " + panelClass);
      const targets = buttons.map(tag => tag.match(/aria-controls="([^"]+)"/)[1]);
      assert.equal(new Set(targets).size, targets.length, path + ": repeated selector");
      assert.deepEqual([...targets].sort(), [...panels].sort(), path + ": selector/panel mismatch");
      assert.equal(buttons.filter(tag => tag.includes('aria-pressed="true"')).length, 1, path);
    }
  }
});

test("Primary menu and drawer have matching addresses and labels", () => {
  for (const path of pages) {
    const html = read(path);
    const links = (cls) => Array.from(html.matchAll(new RegExp('<a class="' + cls + '" href="([^"]+)">([^<]+)</a>', "g")), m => [m[1], m[2]]);
    assert.ok(links("gnb__link").length > 0, path);
    assert.deepEqual(links("gnb__link"), links("header__drawer-link"), path);
  }
});

test("Both languages keep the same slide IDs and local image order", () => {
  const ids = (path) => Array.from(read(path).matchAll(/\bid="([^"]+)"/g), m => m[1]);
  const images = (path) => Array.from(read(path).matchAll(/<img[^>]+src="([^"]+)"/g), m => m[1]);
  assert.deepEqual(ids(pages[0]), ids(pages[1]));
  assert.deepEqual(images(pages[0]), images(pages[1]));
});
