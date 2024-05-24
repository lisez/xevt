import { build, emptyDir } from "@deno/dnt";

const denoInfo = await import("../deno.json", { with: { type: "json" } }).then(
  (e) => e.default,
);

const currentDir = import.meta.dirname;

const output = "./dist";

await emptyDir(output);

await build({
  test: false,
  declaration: false,
  typeCheck: "both",
  entryPoints: ["./modules/xemitter.ts"],
  outDir: output,
  shims: {
    deno: false,
    undici: false,
  },
  compilerOptions: {
    target: "ES2015",
    lib: ["ES2019.Array", "ES2015"],
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
  },
});

Deno.copyFileSync("./LICENSE", output + "/LICENSE");
Deno.copyFileSync("./README.md", output + "/README.md");
