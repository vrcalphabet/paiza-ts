import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'cli/main': 'src/cli/main.tsx',
    'update/main': 'src/update/main.ts',
  },
  minify: true,
  format: 'esm',
  outDir: 'dist',
  clean: true,
  dts: false,
  sourcemap: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  deps: {
    skipNodeModulesBundle: true,
  },
})
