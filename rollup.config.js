import resolve  from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble    from 'rollup-plugin-buble';
import { terser } from "rollup-plugin-terser";
import { version, author, license, description, name } from './package.json';
import fs from 'fs';

const moduleName = 'uistats';

const banner = `\
/**
 * ${name} v${version}
 * ${description}
 *
 * @author ${author}
 * @license ${license}
 * @preserve
 */
`;

module.exports = [{
  input: 'src/index.js',
  output: {
    file: `dist/${moduleName}.js`,
    name: moduleName,
    sourcemap: true,
    format: 'umd',
    banner
  },
  plugins: [
    resolve(),  // so Rollup can find external libs
    commonjs(), // so Rollup can convert commonJS to an ES module
    buble()
  ]
}, {
  input: `src/index.js`,
  output: {
    file: `dist/${moduleName}.min.js`,
    name: moduleName,
    sourcemap: true,
    format: 'umd',
    banner
  },
  plugins: [
    buble(),
    terser({
      sourcemap: true,
      output: {
        comments: 'some'
      }
    })
  ]
}];
