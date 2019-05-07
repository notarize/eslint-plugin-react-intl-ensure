import TypescriptRollup from "rollup-plugin-typescript2";

import Pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: Pkg.main,
      format: "cjs",
    },
    {
      file: Pkg.module,
      format: "es",
    },
  ],
  external: [...Object.keys(Pkg.dependencies)],
  plugins: [TypescriptRollup()],
};
