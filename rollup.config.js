/* eslint-disable no-undef */
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const PACKAGE_ROOT_PATH = process.cwd();

const isReactLib =
  /(browser-cache|memory-cache|on-key|query-params|search)/.test(
    PACKAGE_ROOT_PATH
  );

console.log(PACKAGE_ROOT_PATH);
console.log('REACT-LIB: ', isReactLib ? 'YES' : 'NO');

export default {
  input: PACKAGE_ROOT_PATH + '/src/index.ts',
  output: [
    {
      file: PACKAGE_ROOT_PATH + '/dist/bundle.cjs.js',
      format: 'cjs',
      exports: 'named',
    },
    {
      file: PACKAGE_ROOT_PATH + '/dist/bundle.esm.js',
      format: 'esm',
      exports: 'named',
    },
  ],
  external: isReactLib ? ['react'] : [],
  plugins: [
    cleaner({
      targets: [PACKAGE_ROOT_PATH + '/dist'],
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: PACKAGE_ROOT_PATH + '/tsconfig-prod.json',
    }),
    terser(),
  ],
};
