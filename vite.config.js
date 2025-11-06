import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*'],
      manifest: {
        name: 'TripTale',
        short_name: 'TripTale',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0b1f35',
        icons: [
          { src: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { src: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { src: '/icons/triptale-globe-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/triptale-globe-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: { outDir: 'dist' }
})
