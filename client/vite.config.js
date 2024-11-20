import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import raw from 'vite-plugin-raw';

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
  ],
  server: {
   port: 5173,
   strictPort: true,
   host: true,
  },
 });