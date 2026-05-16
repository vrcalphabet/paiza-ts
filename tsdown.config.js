import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { 'cli/main': 'src/cli/main.tsx' },
  minify: true,
  format: 'esm',
  outDir: 'dist',
  clean: true,
  watch: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  deps: {
    skipNodeModulesBundle: true,
  },
})
