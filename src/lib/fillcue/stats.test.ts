import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_SETTINGS, type Fill } from "./types.ts";
import { enrich, fmt, money, toCsv } from "./stats.ts";

const fills: Fill[] = [
  {
    id: "a",
    vehicleId: "highlander",
    date: "2026-09-01",
    time: "10:00",
    station: "Costco",
    city: "El Paso, TX",
    pump: "1",
    grade: "Regular 87",
    gallons: 10,
    pricePerGal: 3,
    total: 30,
    odometer: 100000,
    clusterRange: 300,
    clusterAvgMph: 30,
    outsideF: 90,
    fillToFull: "Yes",
    tripType: "Mixed",
    notes: "",
  },
  {
    id: "b",
    vehicleId: "highlander",
    date: "2026-09-10",
    time: "11:00",
    station: "Costco",
    city: "El Paso, TX",
    pump: "2",
    grade: "Regular 87",
    gallons: 10,
    pricePerGal: 3,
    total: 30,
    odometer: 100200,
    clusterRange: 280,
    clusterAvgMph: 32,
    outsideF: 88,
    fillToFull: "Yes",
    tripType: "Highway",
    notes: "",
  },
];

describe("enrich", () => {
  const s = enrich(fills, DEFAULT_SETTINGS);
  it("leaves first fill without mpg", () => assert.equal(s.rows[0].mpg, null));
  it("computes tank mpg from odo delta", () => assert.equal(s.rows[1].mpg, 20));
  it("sums gallons", () => assert.equal(s.gallons, 20));
  it("sums spend", () => assert.equal(s.spent, 60));
  it("averages mpg", () => assert.equal(s.avgMpg, 20));
  it("estimates range from usable tank", () => assert.equal(s.rangeEst, 20 * 18.5));
});

describe("formatters", () => {
  it("formats money", () => assert.equal(money(83.61), "$83.61"));
  it("formats empty as em dash", () => assert.equal(fmt(null), "—"));
  it("writes csv header", () => assert.ok(toCsv(enrich(fills, DEFAULT_SETTINGS).rows).startsWith("date,time,station")));
});
