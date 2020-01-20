import builtins from "rollup-plugin-node-builtins";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

const workaround_jsonld_module_system_picker = "process = {version: '1.0.0'}";
const workaround_some_browser_detector = "global = window";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "build/lib.bundle.js",
      format: "esm",
      intro: `const ${workaround_some_browser_detector}, ${workaround_jsonld_module_system_picker};`,
    },
    external: ["lit-element"],
    plugins: [
      builtins(),
      resolve({
        extensions: [".js", ".ts"],
        browser: true,
        only: ["forecast-io"],
      }),
      typescript(),
      postcss({
        inject: false,
      }),
    ],
  },
  {
    input: "src/demo.ts",
    output: {
      file: "build/demo.js",
      format: "esm",
      intro: `const ${workaround_some_browser_detector}, ${workaround_jsonld_module_system_picker};`,
    },
    plugins: [
      builtins(),
      resolve({
        extensions: [".js", ".ts"],
        browser: true,
      }),
      typescript(),
      postcss({
        inject: false,
      }),
    ],
  },
];
