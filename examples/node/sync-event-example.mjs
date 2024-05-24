import { Xevt } from "xevt";

const emitter = new Xevt();
emitter.on("event", (data) => {
  console.log("Event:", data);
});

for (let i = 0; i < 10; i++) {
  emitter.emit("event", i);
}
