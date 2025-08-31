import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/beta/',
  build: { outDir: '../beta', emptyOutDir: true }
})
