/* eslint-disable no-undef */
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import cleaner from "rollup-plugin-cleaner";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const PACKAGE_ROOT_PATH = process.cwd();
const { LERNA_ROOT_PATH } = process.env;

export default {
  input: PACKAGE_ROOT_PATH + "/index.ts",
  output: [
    {
      file: "dist/bundle.cjs.js",
      format: "cjs",
      exports: "named",
    },
    {
      file: "dist/bundle.esm.js",
      format: "esm",
      exports: "named",
    },
  ],
  external: ["react"],
  plugins: [
    cleaner({
      targets: ["./dist"],
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: LERNA_ROOT_PATH + "/tsconfig-prod.json",
    }),
    terser(),
  ],
};
