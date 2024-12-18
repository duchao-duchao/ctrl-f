import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/ctrl-f.bundle.js',
    format: 'umd',
    name: 'ctrl-f',
  },
  plugins: [terser()],
};