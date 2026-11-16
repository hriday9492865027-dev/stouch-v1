import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../Shared'),
      '@pc': path.resolve(__dirname, '../PC'),
      '@capacitor/core': path.resolve(__dirname, './node_modules/@capacitor/core'),
    },
  },
  server: {
    port: 3000,
  },
});
