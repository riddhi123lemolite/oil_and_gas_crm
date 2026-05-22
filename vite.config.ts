import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // The PDF renderer (@react-pdf/renderer) is a large but lazy-loaded
    // chunk — only fetched when a user downloads a PDF.
    chunkSizeWarningLimit: 1600,
  },
});
