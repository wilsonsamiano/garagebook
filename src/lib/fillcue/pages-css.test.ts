import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("GitHub Pages CSS", () => {
  it("scans src so Tailwind utilities ship", () => {
    const css = readFileSync(new URL("../../../src/styles.css", import.meta.url), "utf8");
    assert.match(css, /@source "\.\/\*\*\/\*\.\{ts,tsx\}"/);
    assert.match(css, /input\[type="date"\]/);
    assert.match(css, /-webkit-datetime-edit/);
  });
});
