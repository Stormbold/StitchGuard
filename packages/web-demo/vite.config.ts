import { defineConfig } from 'vite';
import path from 'node:path';

// GitHub Pages project site: https://stormbold.github.io/StitchGuard/
const pagesBase = '/StitchGuard/';

export default defineConfig(({ mode }) => ({
  root: path.resolve(import.meta.dirname),
  publicDir: 'public',
  base: mode === 'production' ? pagesBase : '/',
  build: {
    outDir: 'dist',
  },
}));
