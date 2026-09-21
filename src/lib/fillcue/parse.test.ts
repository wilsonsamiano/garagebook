import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guessPhotoKind, parseChargeReceipt, parseCluster, parseReceipt, parseShopReceipt } from "./parse.ts";
import { SAMPLE_CHARGE, SAMPLE_SHOP } from "./types.ts";


const receipt = `
Costco #483
844 Gateway Center Dr
San Diego, CA 92102
Date: 09/20/26
Time: 12:22
Pump 8
Gallons 14.418
Price $ 5.799
Product Regular
Amount $ 83.61
Total Sale $ 83.61
`;

const cluster = `
Outside 81°F
P
Range
309 miles
After Reset
26 MPH
ODO 112468 miles
`;

describe("parseReceipt", () => {
  const r = parseReceipt(receipt);
  it("reads Costco station", () => assert.ok(r.station.includes("Costco")));
  it("reads gallons", () => assert.equal(r.gallons, 14.418));
  it("reads price per gal", () => assert.equal(r.pricePerGal, 5.799));
  it("reads total", () => assert.equal(r.total, 83.61));
  it("reads date", () => assert.equal(r.date, "2026-09-20"));
  it("reads time", () => assert.equal(r.time, "12:22"));
  it("reads grade", () => assert.ok(r.grade.startsWith("Regular")));
  it("reads city", () => assert.equal(r.city, "San Diego, CA"));
  it("reads pump", () => assert.equal(r.pump, "8"));
});

describe("parseCluster", () => {
  const c = parseCluster(cluster);
  it("reads odometer", () => assert.equal(c.odometer, 112468));
  it("reads range", () => assert.equal(c.clusterRange, 309));
  it("reads mph", () => assert.equal(c.clusterAvgMph, 26));
  it("reads temp", () => assert.equal(c.outsideF, 81));
});

describe("guessPhotoKind", () => {
  it("detects receipts", () => assert.equal(guessPhotoKind(receipt), "receipt"));
  it("detects cluster shots", () => assert.equal(guessPhotoKind(cluster), "cluster"));
  it("detects shop invoices", () => assert.equal(guessPhotoKind(SAMPLE_SHOP), "shop"));
});

describe("parseShopReceipt", () => {
  const s = parseShopReceipt(SAMPLE_SHOP);
  it("reads Firestone", () => assert.equal(s.shop, "Firestone"));
  it("reads total", () => assert.equal(s.total, 153.18));
  it("reads odometer", () => assert.equal(s.odometer, 110210));
  it("reads oil as primary category", () => assert.equal(s.category, "oil"));
  it("summarizes line items", () => assert.ok(s.summary.includes("Oil")));
  it("does not tag cabin as engine air or tires", () => {
    assert.ok(s.summary.includes("Tire rotation"));
    assert.ok(s.summary.includes("Cabin"));
    assert.equal(s.summary.includes("Engine air filter"), false);
    assert.equal(s.summary.includes("Tires"), false);
  });
});

describe("military / extra stations", () => {
  it("detects AAFES", () => {
    const r = parseReceipt("AAFES Express Fort Bliss Pump 3 Gallons 12.400 Price $ 3.199 Total $ 39.67");
    assert.equal(r.station, "AAFES Exchange");
    assert.equal(r.gallons, 12.4);
  });
});

describe("parseChargeReceipt", () => {
  const c = parseChargeReceipt(SAMPLE_CHARGE);
  it("reads Supercharger", () => assert.equal(c.location, "Supercharger"));
  it("reads kWh", () => assert.equal(c.kwh, 42.812));
  it("reads rate", () => assert.equal(c.pricePerKwh, 0.42));
  it("reads total", () => assert.equal(c.total, 17.98));
  it("reads city", () => assert.equal(c.city, "El Paso, TX"));
  it("guesses charge kind", () => assert.equal(guessPhotoKind(SAMPLE_CHARGE), "charge"));
});

