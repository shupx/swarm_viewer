import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "main-app/src/lib.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  tsconfig: "tsconfig.lib.json",
  clean: true,
  outDir: "lib",
  external: ["react", "react-dom", "qiankun", "mitt"],
  sourcemap: false,
});
