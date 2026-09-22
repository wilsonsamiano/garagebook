import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { IOS_GLASS_TOP_MIN, isAppleTouch } from "./safe-area.ts";

describe("iOS safe area", () => {
  it("uses the real inset and does not double-pad a letterboxed webview", () => {
    const css = readFileSync(new URL("../../../src/styles.css", import.meta.url), "utf8");
    const header = readFileSync(new URL("../../../src/routes/index.tsx", import.meta.url), "utf8");
    const tabs = readFileSync(new URL("../../../src/components/fillcue/tab-bar.tsx", import.meta.url), "utf8");
    assert.match(css, /--app-safe-top: env\(safe-area-inset-top/);
    assert.doesNotMatch(css, /max\(132px/);
    assert.match(header, /pt-\[max\(0\.75rem,env\(safe-area-inset-top/);
    assert.doesNotMatch(header, /sticky top-0/);
    assert.doesNotMatch(header, /132px/);
    assert.match(tabs, /pb-\[var\(--app-safe-bottom\)\]/);
    assert.equal(IOS_GLASS_TOP_MIN, 0);
    assert.equal(isAppleTouch(), false);
  });
});
