import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectPowertrain,
  formatEpa,
  isElectricFuel,
  menuItems,
  modelCore,
  parseYearMakeModel,
  pickMake,
  rankModels,
} from "./epa.ts";

describe("parseYearMakeModel", () => {
  it("splits a year-prefixed name", () => {
    assert.deepEqual(parseYearMakeModel("2015 Toyota Highlander XLE"), {
      year: 2015,
      rest: "Toyota Highlander XLE",
    });
  });
  it("rejects a name with no year", () => assert.equal(parseYearMakeModel("Highlander"), null));
});

describe("pickMake", () => {
  const makes = ["Toyota", "Honda", "Mercedes-Benz", "Tesla"];
  it("picks the longest matching make", () => {
    assert.deepEqual(pickMake("Toyota Highlander XLE", makes), { make: "Toyota", model: "Highlander XLE" });
  });
  it("matches Mercedes-Benz", () => {
    assert.deepEqual(pickMake("Mercedes-Benz C300", makes), { make: "Mercedes-Benz", model: "C300" });
  });
});

describe("rankModels", () => {
  it("keeps Highlander drive variants", () => {
    const models = ["Camry", "Highlander 2WD", "Highlander AWD", "Highlander Hybrid AWD", "4Runner 4WD"];
    const ranked = rankModels("Highlander XLE", models);
    assert.ok(ranked.includes("Highlander AWD"));
    assert.ok(ranked.includes("Highlander 2WD"));
    assert.ok(!ranked.includes("Camry"));
    assert.ok(!ranked.includes("4Runner 4WD"));
  });
  it("keeps Model 3 trims", () => {
    const models = ["Model 3 Long Range", "Model 3 Mid Range", "Model S 75D", "Model X 100D"];
    const ranked = rankModels("Model 3", models);
    assert.deepEqual(ranked.filter((m) => m.startsWith("Model 3")).sort(), [
      "Model 3 Long Range",
      "Model 3 Mid Range",
    ]);
    assert.ok(!ranked.includes("Model S 75D"));
  });
});

describe("helpers", () => {
  it("strips drive words from model core", () => {
    assert.equal(modelCore("Highlander AWD"), "highlander");
  });
  it("treats BEV as electric and PHEV as not", () => {
    assert.equal(isElectricFuel("Electricity", "EV"), true);
    assert.equal(isElectricFuel("Regular Gasoline", "", "PHEV"), false);
  });
  it("detects hybrid and plug-in from EPA fields", () => {
    assert.equal(detectPowertrain("Regular Gasoline", "Hybrid", "", "Highlander Hybrid AWD"), "hybrid");
    assert.equal(detectPowertrain("Electricity", "EV", "BEV", "Model 3"), "ev");
    assert.equal(detectPowertrain("Regular Gasoline", "Plug-in Hybrid", "", "Prius Prime"), "phev");
    assert.equal(detectPowertrain("Regular Gasoline", "", "", "Civic"), "ice");
  });
  it("normalizes a single menu item", () => {
    assert.equal(menuItems({ menuItem: { text: "Auto", value: "1" } }).length, 1);
    assert.equal(menuItems({ menuItem: [{ text: "A", value: "1" }, { text: "B", value: "2" }] }).length, 2);
  });
  it("formats EPA as MPG or MPGe", () => {
    const ice = {
      id: "1",
      year: 2015,
      make: "Toyota",
      model: "Highlander AWD",
      option: "Auto",
      city: 18,
      hwy: 24,
      comb: 20,
      fuel: "Regular Gasoline",
      powertrain: "ice" as const,
      drive: "AWD",
      name: "2015 Toyota Highlander AWD",
      tankGal: 19.2,
      usableGal: 18.5,
    };
    assert.equal(formatEpa(ice), "18/24/20 MPG · 19.2 gal");
    assert.equal(formatEpa({ ...ice, powertrain: "ev", city: 136, hwy: 123, comb: 130, tankGal: 0 }), "136/123/130 MPGe");
  });
});
