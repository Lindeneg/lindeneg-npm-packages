/* eslint-disable no-undef */
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const PACKAGE_ROOT_PATH = process.cwd();

const NAME = (() => {
  const s = PACKAGE_ROOT_PATH.split('/');
  return s[s.length - 1];
})();

const isReactLib =
  /^(browser-cache|memory-cache|on-key|query-params|search|http-req)$/.test(NAME);

console.log({
  msg: '@lindeneg/' + NAME,
  isReactLib,
});

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
