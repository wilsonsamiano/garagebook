import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCompleteVin, normalizeVin, vinHint, vinTail } from "./vin.ts";

describe("normalizeVin", () => {
  it("uppercases and strips separators", () => {
    assert.equal(normalizeVin("5td-dk3 dc8fs123456"), "5TDDK3DC8FS123456");
  });
  it("caps at 17", () => {
    assert.equal(normalizeVin("5TDDK3DC8FS123456XXXX").length, 17);
  });
  it("empty stays empty", () => assert.equal(normalizeVin(""), ""));
});

describe("isCompleteVin", () => {
  it("accepts 17 chars without I O Q", () => {
    assert.equal(isCompleteVin("5TDDK3DC8FS123456"), true);
  });
  it("rejects I O Q", () => {
    assert.equal(isCompleteVin("5TDDK3DC8FS12345I"), false);
  });
  it("rejects short", () => assert.equal(isCompleteVin("5TDDK3DC8"), false));
});

describe("vinHint / vinTail", () => {
  it("hints incomplete length", () => {
    assert.match(vinHint("5TDDK3") || "", /6 of 17/);
  });
  it("is silent on a complete VIN", () => assert.equal(vinHint("5TDDK3DC8FS123456"), null));
  it("is silent when empty", () => assert.equal(vinHint(""), null));
  it("shows last six", () => assert.equal(vinTail("5TDDK3DC8FS123456"), "S123456".slice(-6)));
});
