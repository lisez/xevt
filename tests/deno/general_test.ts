import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xemitter } from "modules/xemitter.ts";

it("list all events", () => {
  const emitter = new Xemitter();
  assertEquals(emitter.eventNames(), []);

  emitter.on("foo", () => {});
  emitter.on("bar", () => {});
  emitter.on(["test1", "test2"], () => {});
  emitter.on(["test3", "test2"], () => {});

  assertEquals(emitter.eventNames(), [
    "foo",
    "bar",
    "test1.test2",
    "test2.test3",
  ]);
});
