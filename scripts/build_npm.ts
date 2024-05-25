import { build, emptyDir } from "@deno/dnt";

const denoInfo = await import("../deno.json", { with: { type: "json" } }).then(
  (e) => e.default,
);

const currentDir = import.meta.dirname;

const output = "./dist";

await emptyDir(output);

await build({
  test: false,
  typeCheck: "both",
  entryPoints: ["./modules/xevt.ts"],
  outDir: output,
  shims: {
    deno: false,
    undici: false,
  },
  compilerOptions: {
    target: "ES2015",
    // INFO: https://stackoverflow.com/questions/42105984/cannot-find-name-console-what-could-be-the-reason-for-this
    lib: ["ES2019.Array", "ES2015", "DOM"],
  },
  package: {
    // package.json properties
    name: "xevt",
    version: denoInfo.version,
    description: "another event emiiter.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/lisez/xevt.git",
    },
    bugs: {
      url: "https://github.com/lisez/xevt/issues",
    },
    keywords: [
      "nodejs",
      "deno",
      "async",
      "on",
      "once",
      "event",
      "events",
      "pubsub",
      "pub/sub",
      "publish",
      "subscribe",
      "emit",
      "emits",
      "emitter",
      "eventemitter",
      "event-emitter",
      "addEventListener",
      "conjoin",
      "conjoined",
      "mix",
      "typescript",
    ],
  },
});

Deno.copyFileSync("./LICENSE", output + "/LICENSE");
Deno.copyFileSync("./README.md", output + "/README.md");
