import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from "path";

// If you need Vitest types, add this comment line at the top:
/// <reference types="vitest" />

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});