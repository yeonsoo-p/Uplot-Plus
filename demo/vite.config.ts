import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/Uplot-Plus/',
  root: resolve(__dirname),
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
});
