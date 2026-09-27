import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chargeSaveGaps, fuelSaveGaps, shopSaveGaps } from "./gates.ts";

describe("save gates", () => {
  it("blocks a fuel fill until the cost boxes and odometer are numbers", () => {
    const gaps = fuelSaveGaps({
      date: "2026-09-24",
      gallons: "",
      pricePerGal: "",
      total: "60.01",
      odometer: "",
    });
    assert.deepEqual(gaps, ["gallons", "price per gallon", "odometer"]);
  });

  it("allows a complete fuel fill", () => {
    assert.deepEqual(
      fuelSaveGaps({
        date: "2026-09-24",
        gallons: "13.459",
        pricePerGal: "4.459",
        total: "60.01",
        odometer: "84210",
      }),
      [],
    );
  });

  it("lets a scheduled shop visit through with a due date only", () => {
    assert.deepEqual(
      shopSaveGaps({
        date: "2026-09-24",
        status: "scheduled",
        total: "",
        odometer: "",
        dueDate: "2026-12-01",
        dueMiles: "",
      }),
      [],
    );
  });

  it("blocks a finished shop visit without a total", () => {
    assert.deepEqual(
      shopSaveGaps({
        date: "2026-09-24",
        status: "done",
        total: "",
        odometer: "84210",
        dueDate: "",
        dueMiles: "",
      }),
      ["total"],
    );
  });

  it("blocks a charge until kWh, price, total, and odometer are numbers", () => {
    assert.ok(
      chargeSaveGaps({
        date: "2026-09-24",
        kwh: "",
        pricePerKwh: "",
        total: "12.40",
        odometer: "",
      }).includes("kWh"),
    );
  });
});
