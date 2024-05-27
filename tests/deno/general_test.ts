import { assert, assertEquals, assertIsError } from "jsr:@std/assert";
import { it } from "jsr:@std/testing/bdd";

import { Xevt } from "modules/xevt.ts";

it("list all events", () => {
  const emitter = new Xevt();
  assertEquals(emitter.eventNames(), []);

  emitter.on("foo", () => {});
  emitter.on("bar", () => {});
  emitter.on(["test1", "test2"], () => {});
  emitter.on(["test3", "test2"], () => {});

  assertEquals(emitter.eventNames(), [
    "foo",
    "bar",
    "0.1",
    "1.2",
  ]);
});

it("catch error", () => {
  const emitter = new Xevt();
  let count = 0;
  emitter.on("error", (error) => {
    assertIsError(error);
    count += 1;
  });
  emitter.error((err) => {
    assertIsError(err);
    count += 1;
  });
  emitter.on("event", () => {
    throw new Error("Test error");
  });
  emitter.emit("event");

  assert(count === 2, `Expected 2, got ${count}`);
});

it("remove event handlers", () => {
  const emitter = new Xevt();
  let count = 0;
  const handler = () => {
    count += 1;
  };
  emitter.on("event", handler);
  emitter.emit("event");
  emitter.off("event");
  emitter.emit("event");
  assert(count === 1, `Expected 1, got ${count}`);
});

it("remove conjoined event handlers", () => {
  const emitter = new Xevt();
  let count = 0;
  const handler = () => {
    count += 1;
  };
  emitter.conjoin(["event1", "event2"], handler);
  emitter.emit("event1");
  emitter.emit("event1");
  emitter.emit("event2");
  emitter.off(["event1", "event2"]);
  emitter.emit("event1");
  emitter.emit("event2");
  assert(count === 1, `Expected 0, got ${count}`);
});
