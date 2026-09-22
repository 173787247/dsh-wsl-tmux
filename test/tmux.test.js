import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertSessionName } from "../lib/tmux.js";

describe("tmux name", () => {
  it("accepts simple", () => assert.equal(assertSessionName("build"), "build"));
  it("rejects bad", () => assert.throws(() => assertSessionName("a;b"), /invalid/));
});
