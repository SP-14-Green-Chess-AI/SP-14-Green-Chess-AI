import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  base: "/SP-14-Green-Chess-AI",  // 👈 important
})
