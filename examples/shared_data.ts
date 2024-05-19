import { ConjoinEmitter } from "../modules/conjoin_emitter.ts";
import { Emitter } from "../modules/emitter.ts";
import { RegisteredHandlers } from "../modules/types.ts";

const sharedHandlers: RegisteredHandlers = new Map();
const sharedQueue: any[] = [];

const emitter1 = new Emitter(sharedHandlers, sharedQueue);
const emitter2 = new ConjoinEmitter(sharedHandlers, sharedQueue);

emitter1.on("test", async (args) => {
  console.log("event test", JSON.stringify(args));
}, { signal: new AbortController() });

emitter1.on("test1", () => {
  console.log("event test1");
});

emitter2.on(["test", "test1"], () => {
  console.log("event test and test1");
});

emitter1.emit("test", 1);
emitter1.emit("test", 2);
emitter1.emit("test", 3);
emitter1.emit("test", 4);
emitter1.emit("test", 5);
emitter1.emit("test", 6);
emitter1.emit("test", 7);
emitter1.emit("test", 8);
await new Promise((r) =>
  setTimeout(() => {
    emitter1.emit("test", 14);
    r(true);
  }, 1)
);
await new Promise((r) =>
  setTimeout(() => {
    emitter1.emit("test", 145);
    r(true);
  }, 10)
);
emitter1.emit("test", 9);
emitter1.emit("test", 10);
emitter1.emit("test", 11);
emitter1.emit("test", 12);
emitter1.emit("test", 13);
emitter1.emit("test1");
emitter2.emit("test");
emitter2.emit("test1");
await new Promise((r) => setTimeout(r, 1));
emitter2.emit("test");
