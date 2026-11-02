import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the same build works on GitHub Pages
// (https://<user>.github.io/FOC-Annotation/) and on any other host.
// Target older browsers too, so office PCs with older Chrome/Edge still work.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: ['chrome87', 'edge88', 'firefox78', 'safari14'],
    chunkSizeWarningLimit: 4000,
  },
})
