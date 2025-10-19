import { defineConfig } from 'vite';
import path from 'path';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'obsidian',
        'electron',
        '@codemirror/autocomplete',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/view',
        '@lezer/common',
        '@lezer/highlight',
        '@lezer/lr',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
      output: {
        format: 'cjs',
        exports: 'default',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: 'inline',
  },
});
