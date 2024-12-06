import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['chunk-TZRECEMT.js'],  // Add the problematic dependency here
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Change HTTPS to HTTP if you're not using an SSL certificate
        changeOrigin: true,
      },
    },
  },
});
