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

  it("should listen multiple handlers", () => {
    const emitter = new Xemitter();
    const result: number[] = [];
    emitter.on(["event1", "event2"], () => {
      result.push(1);
    });
    emitter.on(["event1", "event2"], () => {
      result.push(2);
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");

    assertEquals(result, [1, 2, 1, 2]);
  });

  it("should listen multiple async handlers", async () => {
    const emitter = new Xemitter();
    const result: number[] = [];
    emitter.conjoinAsync(["event1", "event2"], async () => {
      result.push(1);
    });
    emitter.conjoinAsync(["event1", "event2"], async () => {
      result.push(2);
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    await delay(0);
    assertEquals(result, [1, 2, 1, 2]);
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
    emitter.on(
      ["event1", "event2"],
      () => {
        count++;
      },
      { once: true },
    );
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
        }, 10),
      );
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    await delay(100);
    assertEquals(result, 4);
  });

  it("mix handlers", async () => {
    const emitter = new Xemitter();
    const result: number[] = [];
    emitter.conjoin(["event1", "event2"], () => {
      result.push(1);
    });
    emitter.conjoinAsync(["event1", "event2"], async () => {
      result.push(2);
    });

    for (let i = 0; i < 5; i++) {
      emitter.emit("event1");
      emitter.emit("event2");
    }
    await delay(100);
    assertEquals(result, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
});
