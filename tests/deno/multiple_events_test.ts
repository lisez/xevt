import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xemitter } from "modules/xemitter.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Xemitter - multiple events", () => {
  it("should listen multiple events", () => {
    const emitter = new Xemitter();

    let count = 0;
    emitter.on(["event1", "event2"], () => {
      count++;
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");

    assert(count === 2, `Expected 2, got ${count}`);
  });

  it("should listen multiple events with addEventListener", () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.addEventListener(["event1", "event2"], () => {
      count++;
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    assert(count === 2, `Expected 2, got ${count}`);
  });

  it('should listen multiple events with "conjoin"', () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.conjoin(["event1", "event2"], () => {
      count++;
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    assert(count === 2, `Expected 2, got ${count}`);
  });

  it("should remove multiple events", () => {
    const emitter = new Xemitter();
    let count = 0;
    const handler = () => {
      count++;
    };

    emitter.on(["event1", "event2"], handler);
    emitter.emit("event1");
    emitter.emit("event2");

    emitter.off(["event1", "event2"], handler);
    emitter.emit("event1");
    emitter.emit("event2");

    assert(count === 1, `Expected 1, got ${count}`);
  });

  it("should listen multiple events once", () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.on(["event1", "event2"], () => {
      count++;
    }, { once: true });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    assert(count === 1, `Expected 1, got ${count}`);
  });

  it("should take every async events", async () => {
    const emitter = new Xemitter();
    let result: number = 0;
    emitter.conjoinAsync(["event1", "event2"], async () => {
      await new Promise((resolve) =>
        setTimeout(() => {
          result++;
          resolve(true);
        }, 100)
      );
    });
    emitter.emit("event1", 1);
    emitter.emit("event2", 2);
    emitter.emit("event1", 3);
    emitter.emit("event2", 4);
    emitter.emit("event1", 5);
    emitter.emit("event2", 6);
    emitter.emit("event1", 7);
    emitter.emit("event2", 8);
    await delay(1000);
    assertEquals(result, 4);
  });
});
