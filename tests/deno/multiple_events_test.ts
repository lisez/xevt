import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xemitter } from "modules/xemitter.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Xemitter - multiple events", () => {
  it("should listen multiple events", async () => {
    const emitter = new Xemitter();

    let count = 0;
    emitter.on(["event1", "event2"], () => {
      count++;
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");

    await delay(emitter.delay * 2);
    assert(count === 2, `Expected 2, got ${count}`);
    await delay(100);
  });

  it("should listen multiple events with addEventListener", async () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.addEventListener(["event1", "event2"], () => {
      count++;
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    await delay(emitter.delay * 2);
    assert(count === 2, `Expected 2, got ${count}`);
    await delay(100);
  });

  it('should listen multiple events with "conjoin"', async () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.conjoin(["event1", "event2"], () => {
      count++;
    });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    await delay(emitter.delay * 2);
    assert(count === 2, `Expected 2, got ${count}`);
    await delay(100);
  });

  it("should remove multiple events", async () => {
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

    await delay(100);
    assert(count === 1, `Expected 1, got ${count}`);
    await delay(100);
  });

  it("should listen multiple events once", async () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.on(["event1", "event2"], () => {
      count++;
    }, { once: true });
    emitter.emit("event1");
    emitter.emit("event2");
    emitter.emit("event1");
    emitter.emit("event2");
    await delay(emitter.delay);
    assert(count === 1, `Expected 1, got ${count}`);
    await delay(100);
  });

  it("should take first event", async () => {
    const emitter = new Xemitter();
    let result: number = 0;
    emitter.conjoinFirst(["event1", "event2"], () => {
      result++;
    });
    emitter.emit("event1", 1);
    emitter.emit("event2", 2);
    emitter.emit("event1", 3);
    emitter.emit("event2", 4);
    emitter.emit("event1", 5);
    emitter.emit("event2", 6);
    emitter.emit("event1", 7);
    emitter.emit("event2", 8);
    await delay(emitter.delay);
    assertEquals(result, 1);
    await delay(100);
  });

  it("should take last event", async () => {
    const emitter = new Xemitter();
    let result: number = 0;
    emitter.conjoinLast(["event1", "event2"], () => {
      result++;
    });
    emitter.emit("event1", 1);
    emitter.emit("event2", 2);
    emitter.emit("event1", 3);
    emitter.emit("event2", 4);
    emitter.emit("event1", 5);
    emitter.emit("event2", 6);
    emitter.emit("event1", 7);
    emitter.emit("event2", 8);
    await delay(emitter.delay);
    assertEquals(result, 1);
    await delay(100);
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
    await delay(100);
  });

  it("should take first event async", async () => {
    const emitter = new Xemitter();
    let result: number = 0;
    emitter.conjoinFirstAsync(["event1", "event2"], async () => {
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
    await delay(200);
    assertEquals(result, 1);
    await delay(100);
  });

  it("should take last event async", async () => {
    const emitter = new Xemitter();
    let result: number = 0;
    emitter.conjoinLastAsync(["event1", "event2"], async () => {
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
    await delay(200);
    assertEquals(result, 1);
    await delay(100);
  });
});
