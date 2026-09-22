import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { IOS_GLASS_TOP_MIN, isAppleTouch } from "./safe-area.ts";

describe("iOS safe area", () => {
  it("pads chrome past the Liquid Glass overlay even when env() is 0", () => {
    const css = readFileSync(new URL("../../../src/styles.css", import.meta.url), "utf8");
    const header = readFileSync(new URL("../../../src/routes/index.tsx", import.meta.url), "utf8");
    const tabs = readFileSync(new URL("../../../src/components/fillcue/tab-bar.tsx", import.meta.url), "utf8");
    assert.match(css, /--app-safe-top/);
    assert.match(css, /max\(110px, env\(safe-area-inset-top/);
    assert.match(header, /min-h-\[110px\]/);
    assert.match(tabs, /pb-\[var\(--app-safe-bottom\)\]/);
    assert.equal(IOS_GLASS_TOP_MIN, 110);
    assert.equal(isAppleTouch(), false);
  });
});
