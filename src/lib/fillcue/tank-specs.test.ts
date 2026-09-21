import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tankFor, usableFromTank } from "./tank-specs.ts";

describe("tankFor", () => {
  it("uses the Toyota Highlander owner's-manual 19.2 gal", () => {
    const t = tankFor(2015, "Toyota", "Highlander AWD", "ice");
    assert.equal(t?.tankGal, 19.2);
    assert.equal(t?.usableGal, 18.5);
  });
  it("uses the smaller hybrid tank", () => {
    const t = tankFor(2015, "Toyota", "Highlander Hybrid AWD", "ice", "Regular Gasoline");
    assert.equal(t?.tankGal, 17.2);
  });
  it("fills 2012 Civic", () => {
    const t = tankFor(2012, "Honda", "Civic", "ice");
    assert.equal(t?.tankGal, 13.2);
    assert.equal(t?.usableGal, 12.7);
  });
  it("zeros EV tanks", () => {
    const t = tankFor(2018, "Tesla", "Model 3 Long Range", "ev");
    assert.equal(t?.tankGal, 0);
    assert.equal(t?.usableGal, 0);
  });
  it("returns null when unknown", () => {
    assert.equal(tankFor(1999, "Plymouth", "Prowler", "ice"), null);
  });
});

describe("usableFromTank", () => {
  it("keeps an explicit usable figure", () => assert.equal(usableFromTank(19.2, 18.5), 18.5));
  it("defaults to 96% of published tank", () => assert.equal(usableFromTank(13.2), 12.7));
});
