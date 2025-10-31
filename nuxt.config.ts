// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n'
  ],

  i18n: {
    locales: [
      {
        code: 'th',
        iso: 'th-TH',
        name: 'ไทย',
        file: 'th.json'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ],
    defaultLocale: 'th',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: [
      'composables/**'
    ]
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.includes('calendar-')
    }
  },
  runtimeConfig: {
    MONGO_URI: process.env.MONGO_URI,
    public: {
      apiBase: '/api'
    }
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    }
  }
})
