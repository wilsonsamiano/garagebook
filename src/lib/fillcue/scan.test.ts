import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyClusterScan,
  applyDocumentScan,
  fitSize,
  formatScanSize,
  otsuThreshold,
  scanByteLength,
} from "./scan.ts";

describe("otsuThreshold", () => {
  it("splits a bimodal histogram", () => {
    const hist = Array.from({ length: 256 }, () => 0);
    hist[20] = 80;
    hist[220] = 80;
    const t = otsuThreshold(hist);
    assert.equal(20 > t, false);
    assert.equal(220 > t, true);
  });
});

describe("applyDocumentScan", () => {
  it("pushes dark ink to black and paper to white", () => {
    const data = new Uint8ClampedArray([40, 40, 40, 255, 240, 240, 240, 255]);
    applyDocumentScan(data);
    assert.equal(data[0], 0);
    assert.equal(data[4], 255);
  });
});

describe("applyClusterScan", () => {
  it("quantizes to 8 gray levels", () => {
    const data = new Uint8ClampedArray([33, 33, 33, 255]);
    applyClusterScan(data);
    assert.equal(data[0], 32);
  });
});

describe("fitSize", () => {
  it("does not upscale", () => {
    assert.deepEqual(fitSize(400, 300, 720), { w: 400, h: 300 });
  });
  it("caps the long edge", () => {
    const s = fitSize(1600, 900, 720);
    assert.equal(s.w, 720);
    assert.equal(s.h, 405);
  });
});

describe("scanByteLength", () => {
  it("decodes base64 payload size", () => {
    const url = "data:image/jpeg;base64,AAAA";
    assert.equal(scanByteLength(url), 3);
  });
  it("formats kilobytes", () => {
    const pad = "A".repeat(Math.ceil((20 * 1024 * 4) / 3));
    assert.match(formatScanSize(`data:image/jpeg;base64,${pad}`), /KB/);
  });
});
