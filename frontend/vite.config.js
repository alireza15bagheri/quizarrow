import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Allow overriding proxy target when running in Docker
const proxyTarget = process.env.VITE_PROXY_TARGET ||
'http://localhost:8000'

export default defineConfig({
  publicDir: 'public',
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/ws': {
        target: proxyTarget.replace('http', 'ws'),
        ws: true,
        changeOrigin: true,
 
     },
    },
  },
  build: {
    outDir: 'dist',
  },
})