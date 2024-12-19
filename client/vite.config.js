import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
  // esbuild: {
  //   target: 'esnext',
  //   platform: 'linux',
  // },
 });