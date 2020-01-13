import builtins from "rollup-plugin-node-builtins";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

const workaround_jsonld_module_system_picker = "process = {version: '1.0.0'}";

const workaround_jsonld_expand_issue = {
  namedExports: {
    jsonld: ["expand"], // fixes "expand is not exported by node_modules/jsonld/lib/index.js"
  },
};

export default [
  {
    input: "src/index.ts",
    output: {
      file: "build/lib.bundle.js",
      format: "esm",
      intro: `const ${workaround_jsonld_module_system_picker};`,
    },
    external: [
      "lit-element",
      "streamed-graph",
      "n3",
      "@polymer/polymer/lib/elements/dom-bind.js",
    ],
    plugins: [
      builtins(),
      resolve({
        extensions: [".js", ".ts"],
        browser: true,
        only: ["bigast-multiformat-clock"],
      }),
      typescript(),
      postcss({
        inject: false,
      }),
      commonjs(workaround_jsonld_expand_issue),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "build/element.bundle.js",
      format: "esm",
      intro: `const ${workaround_jsonld_module_system_picker};`,
    },
    external: [],
    plugins: [
      builtins(),
      resolve({ extensions: [".js", ".ts"], browser: true }),
      typescript(),
      postcss({
        inject: false,
      }),
      commonjs(workaround_jsonld_expand_issue),
    ],
  },
];
