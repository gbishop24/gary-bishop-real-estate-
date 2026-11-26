import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Root-relative paths for Netlify (gary-bishop-real-estate.netlify.app)
  base: '/',
})
