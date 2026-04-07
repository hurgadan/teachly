import tailwindcss from '@tailwindcss/vite'

const apiBase = process.env.NUXT_PUBLIC_API_BASE || process.env.NUXT_API_PROXY_TARGET || 'http://localhost:3001'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  ssr: false,

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },

  app: {
    head: {
      title: 'Teachly',
      htmlAttrs: {
        lang: 'ru',
        'data-theme': 'corporate',
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
