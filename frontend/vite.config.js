import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gjatë zhvillimit, /api përcillet te backend-i (port 5000), pra nuk nevojitet CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
