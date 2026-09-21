import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summarizeOwnership } from "./ownership.ts";
import { ownershipWorkbook } from "./spreadsheet.ts";
import { DEFAULT_SETTINGS, SEED_FILL, type Charge, type ServiceJob } from "./types.ts";

const job: ServiceJob = {
  id: "j1",
  vehicleId: "highlander",
  date: "2026-08-12",
  shop: "Firestone",
  city: "El Paso, TX",
  odometer: 110210,
  total: 153.18,
  category: "oil",
  summary: "Oil change, Tire rotation, Cabin air filter",
  status: "done",
  dueDate: "",
  dueMiles: null,
  notes: "",
};

const scheduled: ServiceJob = {
  ...job,
  id: "j2",
  status: "scheduled",
  total: 999,
  date: "2026-10-01",
};

describe("summarizeOwnership Highlander", () => {
  const s = summarizeOwnership(DEFAULT_SETTINGS, [SEED_FILL], [job, scheduled], [], "2026-09-20");
  it("sums gallons from the log", () => assert.equal(s.gallons, 14.418));
  it("sums fuel spend", () => assert.equal(s.fuelSpend, 83.61));
  it("counts only completed shop visits", () => assert.equal(s.jobCount, 1));
  it("sums shop spend without scheduled jobs", () => assert.equal(s.shopSpend, 153.18));
  it("adds fuel and shop into operating total", () => assert.equal(s.operatingTotal, 83.61 + 153.18));
  it("uses odometer span when purchase odo is missing", () => {
    assert.equal(s.currentOdo, 112464);
    assert.equal(s.milesOwned, 112464 - 110210);
  });
});

describe("summarizeOwnership owned-since filter", () => {
  const settings = { ...DEFAULT_SETTINGS, ownedSince: "2026-09-01", purchaseOdo: 100000 };
  const s = summarizeOwnership(settings, [SEED_FILL], [job], [], "2026-09-20");
  it("drops shop visits before owned-since", () => assert.equal(s.jobCount, 0));
  it("keeps fills on or after owned-since", () => assert.equal(s.fillCount, 1));
  it("uses purchase odometer for miles owned", () => assert.equal(s.milesOwned, 112464 - 100000));
});

describe("summarizeOwnership Tesla energy", () => {
  const charge: Charge = {
    id: "c1",
    vehicleId: "tesla",
    date: "2026-09-18",
    time: "18:40",
    location: "Supercharger",
    city: "El Paso, TX",
    kwh: 42.812,
    pricePerKwh: 0.42,
    total: 17.98,
    odometer: 48210,
    notes: "",
  };
  const settings = { ...DEFAULT_SETTINGS, activeVehicleId: "tesla", powertrain: "ev" as const, vehicle: "2018 Tesla Model 3 LR", purchaseOdo: 40000 };
  const s = summarizeOwnership(settings, [], [], [charge], "2026-09-20");
  it("sums kWh", () => assert.equal(s.kwh, 42.812));
  it("sums energy spend", () => assert.equal(s.energySpend, 17.98));
  it("computes miles per kWh from charge-to-charge odo", () => {
    assert.equal(s.milesOwned, 8210);
    assert.equal(s.miPerKwh, null);
  });
  it("uses two charges for efficiency", () => {
    const second: Charge = { ...charge, id: "c2", date: "2026-09-20", kwh: 40, odometer: 48610, total: 16 };
    const two = summarizeOwnership(settings, [], [], [charge, second], "2026-09-20");
    assert.equal(two.kwh, 82.812);
    assert.equal(two.miPerKwh, 400 / 40);
  });

});

describe("ownershipWorkbook", () => {
  const { xml, filename, summary } = ownershipWorkbook(DEFAULT_SETTINGS, [SEED_FILL], [job], []);
  it("names the file after the vehicle", () => assert.equal(filename, "garagebook-highlander-ownership.xls"));
  it("emits Excel XML worksheets", () => {
    assert.ok(xml.includes("ss:Name=\"Ownership\""));
    assert.ok(xml.includes("ss:Name=\"Fuel\""));
    assert.ok(xml.includes("ss:Name=\"Charging\""));
    assert.ok(xml.includes("ss:Name=\"Shop\""));
    assert.ok(xml.includes("Costco #483"));
    assert.ok(xml.includes("Firestone"));
    assert.ok(xml.includes("unofficial estimates"));
  });
  it("returns the same totals as summarize", () => assert.equal(summary.operatingTotal, 83.61 + 153.18));
});
