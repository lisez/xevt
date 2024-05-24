import { Xemitter } from "xevt";

const emitter = new Xemitter();
emitter.on("event", (data) => {
  console.log("sync hanlder:", data);
});
emitter.onAsync(
  "event",
  async (data) =>
    new Promise((res) => {
      setTimeout(() => {
        console.log("async handler:", data);
        res();
      }, 100);
    }),
);

for (let i = 0; i < 10; i++) {
  await emitter.emit("event", i);
}
