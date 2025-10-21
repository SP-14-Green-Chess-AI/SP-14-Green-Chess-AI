import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/SP-14-Green-Chess-AI/', // Matches your deployment path
  plugins: [react()],
  build: {
    outDir: 'dist', // Default output directory
    assetsDir: 'assets', // Default assets folder
  },
});