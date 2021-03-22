import path from 'path';
import rollupPluginCopy from 'rollup-plugin-copy';
import rollupPluginDelete from 'rollup-plugin-delete';
import rollupPluginPostcss from 'rollup-plugin-postcss';
import rollupPluginTypescript from '@rollup/plugin-typescript';
import { terser as rollupPluginTerser } from 'rollup-plugin-terser';
import { nodeResolve as rollupPluginNodeResolve } from '@rollup/plugin-node-resolve';

const production = process.env.NODE_ENV === 'production';

/**
 * @type {import('rollup').RollupOptions}
 */
const optiosn = {
  input: 'src/index.ts',
  output: [
    {
      dir: './dist/',
      format: 'esm',
      sourcemap: !production,
      entryFileNames: 'index.esm.js',
    },
    {
      dir: './dist/',
      name: 'SlideTuning',
      format: 'umd',
      sourcemap: !production,
      entryFileNames: 'index.js',
    },
  ],
  plugins: [
    rollupPluginCopy(
      {
        targets: [
          {
            src: 'src/assets/**/*',
            dot: true,
            dest: path.join(__dirname, './dist/assets'),
          },
        ],
      },
    ),
    rollupPluginDelete(
      {
        targets: [
          './dist/**/*'
        ],
      }
    ),
    rollupPluginPostcss(
      {
        // extract: path.join(__dirname, './dist/style.css'),
        minimize: production,
      }
    ),
    rollupPluginTypescript(
      {
        tsconfig: 'tsconfig.json'
      },
    ),
    rollupPluginNodeResolve(),
    production && rollupPluginTerser(
      {
        format: {
          comments: false,
        },
      }
    ),
  ],
};

export default optiosn;
