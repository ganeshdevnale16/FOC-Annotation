import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the same build works on GitHub Pages
// (https://<user>.github.io/FOC-Annotation/) and on any other host.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
