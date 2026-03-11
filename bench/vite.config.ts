import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      'uplot': resolve(__dirname, '../reference/uPlot/dist/uPlot.esm.js'),
      'uplot-wrappers-common': resolve(__dirname, '../reference/uplot-wrappers/common/index.ts'),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        'uplot-original': resolve(__dirname, 'uplot-original.html'),
        'uplot-plus': resolve(__dirname, 'uplot-plus.html'),
        'uplot-react-wrapper': resolve(__dirname, 'uplot-react-wrapper.html'),
        'uplot-original-large': resolve(__dirname, 'uplot-original-large.html'),
        'uplot-plus-large': resolve(__dirname, 'uplot-plus-large.html'),
        'uplot-react-wrapper-large': resolve(__dirname, 'uplot-react-wrapper-large.html'),
        compare: resolve(__dirname, 'compare.html'),
      },
    },
  },
});
