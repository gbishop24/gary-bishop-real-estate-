import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project Pages URL: https://gbishop24.github.io/gary-bishop-real-estate-/
  base: '/gary-bishop-real-estate-/',
})
