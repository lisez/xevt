import { Xemitter } from "xevt";

const emitter = new Xemitter();
emitter.on("event1", (data) => {
  console.log("Event1:", data);
});
emitter.on("event2", (data) => {
  console.log("Event2:", data);
});
emitter.conjoin(["event1", "event2"], () => {
  console.log("Conjoined event");
});

for (let i = 0; i < 10; i++) {
  emitter.emit("event1", i);
  emitter.emit("event2", i);
}
