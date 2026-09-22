import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("iOS safe area", () => {
  it("pads chrome past the Liquid Glass overlay", () => {
    const css = readFileSync(new URL("../../../src/styles.css", import.meta.url), "utf8");
    const header = readFileSync(new URL("../../../src/routes/index.tsx", import.meta.url), "utf8");
    const tabs = readFileSync(new URL("../../../src/components/fillcue/tab-bar.tsx", import.meta.url), "utf8");
    assert.match(css, /--app-safe-top/);
    assert.match(css, /safe-area-inset-top/);
    assert.match(header, /pt-\[var\(--app-safe-top\)\]/);
    assert.match(tabs, /pb-\[var\(--app-safe-bottom\)\]/);
  });
});
