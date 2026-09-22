import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("GarageBook PWA", () => {
  const manifest = JSON.parse(readFileSync(new URL("../../../public/manifest.webmanifest", import.meta.url), "utf8"));
  const sw = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8");

  it("is named GarageBook and standalone", () => {
    assert.equal(manifest.name, "GarageBook");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "./");
    assert.equal(manifest.theme_color, "#1B365D");
  });

  it("ships 192, 512, and maskable icons", () => {
    const sizes = manifest.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes}:${i.purpose}`);
    assert.ok(sizes.includes("192x192:any"));
    assert.ok(sizes.includes("512x512:any"));
    assert.ok(sizes.includes("512x512:maskable"));
  });

  it("caches the app shell and Tesseract, not EPA", () => {
    assert.match(sw, /garagebook-v2/);
    assert.match(sw, /tesseract/);
    assert.match(sw, /fueleconomy\.gov/);
    assert.match(sw, /shouldBypass/);
  });
});
