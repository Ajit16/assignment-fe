import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // 👇 VITAL: Tell Vercel where API routes are
  server: {
    proxy: {
      '/api': {
        target: 'https://api.jsonbin.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
