import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  // Source map untuk debugging produksi (audit Lighthouse "Missing source maps").
  build: {
    sourcemap: true,
  },
  // `npm start` (vite preview) untuk server deployment: port dari env PORT/APP_PORT,
  // terima semua host (domain *.s1if.cloud), fallback SPA otomatis ke index.html.
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || process.env.APP_PORT) || 4173,
    strictPort: true,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})