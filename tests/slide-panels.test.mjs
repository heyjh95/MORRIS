import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

// Load the real site functions without a browser; initializers skip absent sections.
function loadFunctions() {
  const warnings = [];
  const context = createContext({
    document: { querySelector: () => null },
    console: { warn: message => warnings.push(message) },
  });
  runInContext(readFileSync(new URL("../js/main.js", import.meta.url), "utf8"), context);
  return { prepare: context.prepareSlidePanels, warnings };
}

function elements(count) {
  return Array.from({ length: count }, () => ({
    id: "",
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
  }));
}

test("Automatic panel IDs uniquely connect every button, panel and title across groups", () => {
  const { prepare, warnings } = loadFunctions();
  const ids = [];
  for (const prefix of ["hero", "category", "brand"]) {
    const buttons = elements(3);
    const panels = elements(3);
    const titles = elements(3);
    assert.equal(prepare(buttons, panels, titles, prefix), true);
    panels.forEach((panel, index) => {
      assert.ok(panel.id);
      assert.ok(titles[index].id);
      assert.equal(buttons[index].attributes["aria-controls"], panel.id);
      assert.equal(panel.attributes["aria-labelledby"], titles[index].id);
      ids.push(panel.id, titles[index].id);
    });
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(warnings.length, 0);
});

test("Mismatched or empty groups warn and stop before creating partial connections", () => {
  const { prepare, warnings } = loadFunctions();
  for (const [buttonCount, panelCount, titleCount] of [[1, 2, 2], [2, 2, 1], [0, 0, 0]]) {
    const buttons = elements(buttonCount);
    const panels = elements(panelCount);
    const titles = elements(titleCount);
    assert.equal(prepare(buttons, panels, titles, "category"), false);
    for (const element of [...buttons, ...panels, ...titles]) {
      assert.equal(element.id, "");
      assert.deepEqual(element.attributes, {});
    }
  }
  assert.equal(warnings.length, 3);
});
