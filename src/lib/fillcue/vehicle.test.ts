import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_SETTINGS,
  VEHICLE_PRESETS,
  captureModesFor,
  coerceCaptureMode,
  draftToFill,
  emptyDraft,
  settingsFromVehicle,
  vehicleFromPreset,
  vehicleFromSettings,
} from "./types.ts";

describe("vehicle ↔ settings", () => {
  it("round-trips the active vehicle including VIN", () => {
    const v = vehicleFromSettings({ ...DEFAULT_SETTINGS, vin: "5TDDK3DC8FS123456" });
    assert.equal(v.id, "highlander");
    assert.equal(v.vin, "5TDDK3DC8FS123456");
    const s = settingsFromVehicle(v);
    assert.equal(s.activeVehicleId, "highlander");
    assert.equal(s.vehicle, DEFAULT_SETTINGS.vehicle);
    assert.equal(s.vin, "5TDDK3DC8FS123456");
  });

  it("builds an EV from the Tesla preset with a new id", () => {
    const tesla = VEHICLE_PRESETS.find((p) => p.id === "tesla");
    assert.ok(tesla);
    const v = vehicleFromPreset(tesla, { id: "abc", vin: "5YJ3E1EA7JF000001" });
    assert.equal(v.id, "abc");
    assert.equal(v.powertrain, "ev");
    assert.equal(v.tankGal, 0);
    assert.equal(v.vin, "5YJ3E1EA7JF000001");
  });
});

describe("capture modes", () => {
  it("gives hybrids fuel + shop, plug-ins fuel + charge + shop", () => {
    assert.deepEqual(
      captureModesFor("hybrid").map((m) => m.id),
      ["fuel", "shop"],
    );
    assert.deepEqual(
      captureModesFor("phev").map((m) => m.id),
      ["fuel", "charge", "shop"],
    );
    assert.deepEqual(
      captureModesFor("ev").map((m) => m.id),
      ["charge", "shop"],
    );
  });

  it("coerces a fuel tab on an EV to charge", () => {
    assert.equal(coerceCaptureMode("ev", "fuel"), "charge");
    assert.equal(coerceCaptureMode("ice", "charge"), "fuel");
    assert.equal(coerceCaptureMode("phev", "charge"), "charge");
  });
});

describe("draftToFill scans", () => {
  it("keeps compact scans with the fill", () => {
    const fill = draftToFill(emptyDraft({ id: "f1", date: "2026-09-20", station: "Costco" }), {
      vehicleId: "highlander",
      receiptScan: "data:image/jpeg;base64,AAAA",
      clusterScan: "data:image/jpeg;base64,BBBB",
    });
    assert.equal(fill.receiptScan, "data:image/jpeg;base64,AAAA");
    assert.equal(fill.clusterScan, "data:image/jpeg;base64,BBBB");
  });
});
