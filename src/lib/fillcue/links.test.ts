import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APP_LINKS } from "./links.ts";

describe("app links", () => {
  it("always ships live, GitHub, and Buy Me a Coffee URLs", () => {
    assert.match(APP_LINKS.live, /^https:\/\/wilsonsamiano\.github\.io\/garagebook\/$/);
    assert.match(APP_LINKS.github, /^https:\/\/github\.com\/wilsonsamiano\/garagebook$/);
    assert.equal(APP_LINKS.coffee, "https://buymeacoffee.com/wilsonsamiano");
  });
});
