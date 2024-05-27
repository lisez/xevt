import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xevt } from "modules/xevt.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Xevt - multiple events", () => {
  it("should listen multiple events", () => {
    const emitter = new Xevt();

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

  it("should listen numeric events", () => {
    const emitter = new Xevt();
    let result = 0;
    emitter.on([0, 1], () => {
      result++;
    });
    emitter.emit(0);
    emitter.emit(1);
    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen multiple handlers", () => {
    const emitter = new Xevt();
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
    const emitter = new Xevt();
    const result: number[] = [];
    // deno-lint-ignore require-await
    emitter.conjoin(["event1", "event2"], async () => {
      result.push(1);
    });
    // deno-lint-ignore require-await
    emitter.conjoin(["event1", "event2"], async () => {
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
    const emitter = new Xevt();
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
    const emitter = new Xevt();
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
    const emitter = new Xevt();
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
    const emitter = new Xevt();
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
    const emitter = new Xevt();
    let result: number = 0;
    emitter.conjoin(["event1", "event2"], async () => {
      await new Promise((resolve) =>
        setTimeout(() => {
          result++;
          resolve(true);
        }, 10)
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
    const emitter = new Xevt();
    const result: number[] = [];
    emitter.conjoin(["event1", "event2"], () => {
      result.push(1);
    });
    // deno-lint-ignore require-await
    emitter.conjoin(["event1", "event2"], async () => {
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

describe("Xevt - unscriber", () => {
  it("return unscribe function", () => {
    const emitter = new Xevt();
    const result: number[] = [];
    const unscribe = emitter.conjoin(["event1", "event2"], () => {
      result.push(1);
    });
    emitter.emit("event1");
    emitter.emit("event2");
    unscribe();
    emitter.emit("event1");
    emitter.emit("event2");
    assertEquals(result, [1]);
  });
});
