import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xemitter } from "modules/xemitter.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Xemitter - single event", () => {
  it("should listen event", () => {
    const emitter = new Xemitter();

    let result = 0;
    emitter.on("event", () => {
      result++;
    });
    emitter.emit("event");

    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen event multiple times", () => {
    const emitter = new Xemitter();

    let result = 0;
    emitter.on("event", () => {
      result++;
    });
    Array.from({ length: 10 }).forEach(() => emitter.emit("event"));

    assert(result === 10, `Expected 10, got ${result}`);
  });

  it('should listen event with "addEventListener"', () => {
    const emitter = new Xemitter();
    let result = 0;
    emitter.addEventListener("event", () => {
      result++;
    });
    emitter.emit("event");
    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should remove event", () => {
    const emitter = new Xemitter();
    let result = 0;
    const handler = () => {
      result++;
    };
    emitter.on("event", handler);
    emitter.emit("event");
    emitter.off("event", handler);
    emitter.emit("event");

    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen event once", () => {
    const emitter = new Xemitter();
    let count = 0;
    emitter.on("event", () => {
      count++;
    }, { once: true });

    emitter.emit("event");
    emitter.emit("event");

    assert(count === 1, `Expected 1, got ${count}`);
  });

  it('should listen event with "addEventListener"', () => {
    const emitter = new Xemitter();
    let result = 0;
    emitter.addEventListener("event", () => {
      result++;
    });
    emitter.emit("event");
    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen every async events", async () => {
    const emitter = new Xemitter();
    const result: number[] = [];
    emitter.onAsync("event", async (arg) => {
      await new Promise((resolve) =>
        setTimeout(() => {
          result.push(arg);
          resolve(true);
        }, 100)
      );
    });
    emitter.emit("event", 1);
    emitter.emit("event", 2);
    emitter.emit("event", 3);
    emitter.emit("event", 4);
    emitter.emit("event", 5);
    emitter.emit("event", 6);
    emitter.emit("event", 7);
    emitter.emit("event", 8);
    await delay(1000);
    assertEquals(result, [1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
