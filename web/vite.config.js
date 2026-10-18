import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const target = 'http://localhost:3001'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target, changeOrigin: true },
      '/api_file': { target, changeOrigin: true },
      '/files': { target, changeOrigin: true },
      '/uploads': { target, changeOrigin: true }
    }
  }
})
