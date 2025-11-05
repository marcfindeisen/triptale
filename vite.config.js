import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      includeAssets: ['icons/*'],
      manifest: false, // benutze das manuelle Manifest im public-Ordner
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      }
    })
  ]
})
