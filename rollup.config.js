import terser from '@rollup/plugin-terser'
import multi from '@rollup/plugin-multi-entry'

export default [
  {
    input: {
      include: ['scripts/*.js', 'scripts/*/*.js'],
      exclude: ['scripts/token-action-hud-ds4.min.js']
    },
    output: {
      format: 'esm',
      file: 'scripts/token-action-hud-ds4.min.js',
      sourcemap: true
    },
    plugins: [terser({ keep_classnames: true, keep_fnames: true }), multi()]
  }
]
