import { Xemitter } from "../modules/xemitter.ts";

const emitter = new Xemitter();
let count = 0;
emitter.on(["event1", "event2"], () => {
  count++;
  console.log(count);
}, { once: true });
emitter.emit("event1");
emitter.emit("event2");
emitter.emit("event1");
emitter.emit("event2");

console.log(count);
