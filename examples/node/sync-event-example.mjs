import { Xemitter } from "xevt";

const emitter = new Xemitter();
emitter.on("event", (data) => {
  console.log("Event:", data);
});

for (let i = 0; i < 10; i++) {
  emitter.emit("event", i);
}
