import { Xemitter } from "../modules/xemitter.ts";

const emitter1 = new Xemitter();

emitter1.leadAsync("test", async (args) => {
  console.log("event test +", JSON.stringify(args));
  await new Promise((r) => setTimeout(r, 20000));
}, { signal: new AbortController(), detach: true });

emitter1.on("test1", (args) => {
  console.log("event test1", JSON.stringify(args));
});

emitter1.on(["test", "test1"], () => {
  console.log("event test and test1");
}, { once: true });

emitter1.emit("test", 1);
emitter1.emit("test", 2);
emitter1.emit("test", 3);
emitter1.emit("test", 4);
emitter1.emit("test", 5);
// new Promise((r) =>
//   setTimeout(() => {
//     emitter1.emit("test", 20);
//     r(true);
//   }, 10000)
// );
emitter1.emit("test", 6);
emitter1.emit("test", 7);
emitter1.emit("test", 8);
new Promise((r) =>
  setTimeout(() => {
    emitter1.emit("test", 9);
    r(true);
  }, 15)
);
new Promise((r) =>
  setTimeout(() => {
    emitter1.emit("test", 10);
    r(true);
  }, 10)
);
emitter1.emit("test", 11);
emitter1.emit("test", 12);
emitter1.emit("test", 13);
emitter1.emit("test", 14);
emitter1.emit("test", 15);
emitter1.emit("test1", 16);
emitter1.emit("test", 17);
emitter1.emit("test1", 18);
await new Promise((r) => setTimeout(r, 1));
emitter1.emit("test", 19);
