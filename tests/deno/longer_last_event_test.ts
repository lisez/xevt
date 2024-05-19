import { assert, assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";

import { Xemitter } from "modules/xemitter.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

it("should waiting long process events", async () => {
  const emitter = new Xemitter();

  const result: number[] = [];
  emitter.lastAsync("event", async (arg) => {
    await new Promise((resolve) =>
      setTimeout(() => {
        result.push(arg);
        resolve(true);
      }, 1000)
    );
  }, { detach: true });

  emitter.on("event1", async (arg) => {
    await new Promise((resolve) =>
      setTimeout(() => {
        result.push(arg);
        resolve(true);
      }, 300)
    );
  });

  emitter.emit("event", 1);
  emitter.emit("event", 2);
  emitter.emit("event", 3);
  emitter.emit("event", 4);
  emitter.emit("event", 5);
  emitter.emit("event", 6);
  emitter.emit("event1", 7);

  await delay(1500);
  assertEquals(result, [7, 6]);
});
