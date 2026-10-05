import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  // Относительная база: сайт живёт в подпапке GitHub Pages
  base: './',
  plugins: [react()],
  build: { assetsInlineLimit: 0 },
  // При пререндере Vite подставляет BASE_URL = '/', из-за чего разметка расходится с клиентской
  define: isSsrBuild ? { 'import.meta.env.BASE_URL': JSON.stringify('./') } : {},
}))
