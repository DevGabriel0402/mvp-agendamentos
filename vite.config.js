import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Agendamento SaaS MVP',
        short_name: 'Agendamento',
        description: 'App de Agendamento SaaS',
        theme_color: '#FAFAF8',
        background_color: '#FAFAF8',
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/[a-zA-Z0-9_-]+\/admin/], // Vou manter apenas o que for estritamente necessário ou limpar se quiser tudo no SPA
        // Na verdade, para resolver o aviso do usuário, vamos limpar o denylist automático do Workbox ou ajustá-lo
        navigateFallbackAllowlist: [/^.*$/], // Permite que todas as rotas caiam no index.html para o SPA lidar
        // Permitir que todas as rotas de admin sejam tratadas pelo SPA index.html
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
