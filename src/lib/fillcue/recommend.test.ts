import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currentOdometer, recommend, upcoming, DUE_DISCLAIMER_SHORT } from "./recommend.ts";
import { SEED_FILL, type Fill, type ServiceJob } from "./types.ts";

describe("recommend Highlander at 112k", () => {
  const recs = recommend("ice", [SEED_FILL], [], "2026-09-20");
  it("flags oil as overdue when never logged", () => {
    const oil = recs.find((r) => r.category === "oil");
    assert.ok(oil);
    assert.equal(oil.status, "overdue");
  });
  it("flags transmission as overdue past 100k", () => {
    const atf = recs.find((r) => r.category === "transmission");
    assert.ok(atf);
    assert.equal(atf.status, "overdue");
  });
  it("puts spark plugs within 8k of 120k", () => {
    const plugs = recs.find((r) => r.category === "spark-plugs");
    assert.ok(plugs);
    assert.ok((plugs.milesLeft ?? 0) < 8000);
  });
  it("lists upcoming items", () => {
    assert.ok(upcoming(recs).length >= 4);
  });
});

describe("recommend with a logged oil change", () => {
  const job: ServiceJob = {
    id: "j1",
    vehicleId: "highlander",
    date: "2026-08-01",
    shop: "Firestone",
    city: "El Paso, TX",
    odometer: 111000,
    total: 80,
    category: "oil",
    summary: "Oil change",
    status: "done",
    dueDate: "",
    dueMiles: null,
    notes: "",
  };
  const recs = recommend("ice", [SEED_FILL], [job], "2026-09-20");
  it("oil is ok until 116k", () => {
    const oil = recs.find((r) => r.category === "oil");
    assert.ok(oil);
    assert.equal(oil.status, "ok");
    assert.equal(oil.dueMiles, 116000);
  });
});

describe("recommend Tesla", () => {
  const fill: Fill = { ...SEED_FILL, id: "t1", vehicleId: "tesla", odometer: 42000 };
  const recs = recommend("ev", [fill], [], "2026-09-20");
  it("has no oil interval", () => {
    assert.equal(recs.find((r) => r.category === "oil"), undefined);
  });
  it("flags rotation overdue past 6250", () => {
    const rot = recs.find((r) => r.category === "rotation");
    assert.ok(rot);
    assert.equal(rot.status, "overdue");
  });
});

describe("recommend hybrid still needs oil", () => {
  const recs = recommend("hybrid", [SEED_FILL], [], "2026-09-20");
  it("keeps oil on the due list", () => {
    assert.ok(recs.find((r) => r.category === "oil"));
  });
  it("mentions inverter coolant", () => {
    const cool = recs.find((r) => r.category === "coolant");
    assert.ok(cool?.hint.includes("inverter"));
  });
});

describe("currentOdometer", () => {
  it("uses the highest fill or job odo", () => {
    assert.equal(currentOdometer([SEED_FILL], []), 112464);
  });
});

describe("due disclaimer", () => {
  it("says these are not the manufacturer schedule", () => {
    assert.ok(DUE_DISCLAIMER_SHORT.toLowerCase().includes("manufacturer"));
  });
});
