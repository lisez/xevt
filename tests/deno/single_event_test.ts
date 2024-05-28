import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xevt } from "modules/xevt.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Xevt - single event", () => {
  it("should listen event", () => {
    const emitter = new Xevt();

    let result = 0;
    emitter.on("event", () => {
      result++;
    });
    emitter.emit("event");

    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen numeric events", () => {
    const emitter = new Xevt();
    let result = 0;
    emitter.on(1, () => {
      result++;
    });
    emitter.emit(1);
    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen event multiple times", () => {
    const emitter = new Xevt();

    let result = 0;
    emitter.on("event", () => {
      result++;
    });
    Array.from({ length: 10 }).forEach(() => emitter.emit("event"));

    assert(result === 10, `Expected 10, got ${result}`);
  });

  it('should listen event with "addEventListener"', () => {
    const emitter = new Xevt();
    let result = 0;
    emitter.addEventListener("event", () => {
      result++;
    });
    emitter.emit("event");
    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should remove event", () => {
    const emitter = new Xevt();
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
    const emitter = new Xevt();
    let count = 0;
    emitter.on(
      "event",
      () => {
        count++;
      },
      { once: true },
    );

    emitter.emit("event");
    emitter.emit("event");

    assert(count === 1, `Expected 1, got ${count}`);
  });

  it('should listen event with "addEventListener"', () => {
    const emitter = new Xevt();
    let result = 0;
    emitter.addEventListener("event", () => {
      result++;
    });
    emitter.emit("event");
    assert(result === 1, `Expected 1, got ${result}`);
  });

  it("should listen every async events", async () => {
    const emitter = new Xevt();
    const result: number[] = [];
    emitter.on("event", async (arg) => {
      await new Promise((resolve) =>
        setTimeout(() => {
          result.push(arg);
          resolve(true);
        }, 10)
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
    await delay(100);
    assertEquals(result, [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("mix handlers - blocking", async () => {
    const emitter = new Xevt();
    const result: number[] = [];
    emitter.on("event", (data) => {
      result.push(data);
    });
    emitter.on(
      "event",
      // deno-lint-ignore require-await
      async (data) =>
        new Promise((res) => {
          setTimeout(() => {
            result.push(data);
            res(true);
          }, 1);
        }),
      { async: true },
    );

    for (let i = 0; i < 5; i++) {
      emitter.emit("event", i);
    }
    await delay(10);
    assertEquals(result, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("mix handlers - non-blocking", async () => {
    const emitter = new Xevt();
    const result: number[] = [];
    emitter.on("event", (data) => {
      result.push(data);
    });
    emitter.on(
      "event",
      // deno-lint-ignore require-await
      async (data) =>
        new Promise((res) => {
          setTimeout(() => {
            result.push(data);
            res(true);
          }, 1);
        }),
      { async: false },
    );

    for (let i = 0; i < 5; i++) {
      emitter.emit("event", i);
    }
    await delay(10);
    assertEquals(result, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });
});

describe("Xevt - unscriber", () => {
  it("return unscribe function", () => {
    const emitter = new Xevt();
    const result: number[] = [];
    const unscribe = emitter.on("event", (arg: number) => {
      result.push(arg);
    });
    emitter.emit("event", 1);
    unscribe();
    emitter.emit("event", 2);
    assertEquals(result, [1]);
  });
});

describe("Xevt - on", () => {
  it('should listen event with "on"', () => {
    const emitter = new Xevt();
    const result: number[] = [];
    emitter.on("event", (arg: number) => {
      result.push(arg);
      return arg % 2 === 0;
    });

    emitter.on("event", {
      true: () => {
        result.push(100);
      },
      false: () => {
        result.push(99);
      },
    });

    emitter.emit("event", 1);
    emitter.emit("event", 2);
    assertEquals(result, [1, 99, 2, 100]);
  });

  it("should listen multiple on events", () => {
    const emitter = new Xevt();
    const result: any[] = [];
    emitter.on("event", (arg: number) => {
      result.push(arg);
      return arg % 2 === 0;
    });

    emitter.on("event", {
      true: () => {
        result.push("first");
      },
    });

    emitter.on("event", {
      false: () => {
        result.push("fail");
      },
    });

    emitter.on("event", {
      true: () => {
        result.push(100);
      },
      false: () => {
        result.push(99);
      },
    });

    emitter.emit("event", 1);
    emitter.emit("event", 2);
    assertEquals(result, [1, "fail", 99, 2, "first", 100]);
  });

  it("should listen once on event", () => {
    const emitter = new Xevt();
    const result: any[] = [];
    emitter.on("event", (arg: number) => {
      result.push(arg);
      return arg % 2 === 0;
    });

    emitter.on("event", {
      true: () => {
        result.push("first");
      },
    });

    emitter.on("event", {
      false: () => {
        result.push("fail");
      },
    });

    emitter.on("event", {
      true: () => {
        result.push(100);
      },
      false: () => {
        result.push(99);
      },
    }, { once: true });

    emitter.emit("event", 1);
    emitter.emit("event", 2);
    emitter.emit("event", 1);
    emitter.emit("event", 2);

    assertEquals(result, [1, "fail", 99, 2, "first", 1, "fail", 2, "first"]);
  });

  it("should listen async on events", async () => {
    const emitter = new Xevt();
    const result: any[] = [];
    emitter.on("event", (arg: number) => {
      result.push(arg);
      return arg % 2 === 0;
    });

    emitter.on("event", {
      // deno-lint-ignore require-await
      true: async () => {
        result.push("first");
      },
    });

    emitter.on("event", {
      // deno-lint-ignore require-await
      false: async () => {
        result.push("fail");
      },
    });

    emitter.on("event", {
      true: () => {
        result.push(100);
      },
      false: () => {
        result.push(99);
      },
    });

    emitter.emit("event", 1);
    emitter.emit("event", 2);
    await delay(10);
    assertEquals(result, [1, "fail", 99, 2, "first", 100]);
  });
});
