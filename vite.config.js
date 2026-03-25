// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,          // binds to 0.0.0.0 (LAN + localhost)
    port: 11550,
    strictPort: true,
    // optional but helps if host header gets blocked in newer Vite:
    // allowedHosts: ['app.dummy.testcrm.localtest.me', '.nip.io', 'localhost'],
    // optional for phone HMR stability:
    // hmr: { host: '192.168.1.23' },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
