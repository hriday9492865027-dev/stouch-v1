import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../Shared'),
      '@pc': path.resolve(__dirname, '../PC'),
      '@smartboard': path.resolve(__dirname, '../SmartBoard'),
      '@tv': path.resolve(__dirname, '../TV'),
      '@capacitor/core': path.resolve(__dirname, './node_modules/@capacitor/core'),
    },
  },
  server: {
    port: 3000,
  },
});
