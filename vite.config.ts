import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/aided-loegairi-buadaig/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      port: 5175,
      host: '0.0.0.0'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3600',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
})
