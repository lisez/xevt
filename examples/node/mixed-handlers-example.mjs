import { Xevt } from "xevt";

const emitter = new Xevt();
emitter.on("event", (data) => {
  console.log("sync handler:", data);
});
emitter.onAsync(
  "event",
  // deno-lint-ignore require-await
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
