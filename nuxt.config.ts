import WebSocket from 'ws'

// Polyfill de WebSocket para Node.js < 22 em ambiente SSR
if (typeof globalThis.WebSocket === 'undefined') {
  // @ts-expect-error WebSocket polyfill for Node runtime
  globalThis.WebSocket = WebSocket
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],

  // Configuração do módulo Supabase
  supabase: {
    // Redirecionar para login admin e processar PKCE no callback
    redirectOptions: {
      login: '/gestao/login',
      callback: '/gestao/confirm',
      exclude: [
        '/gestao/login',
        '/gestao/recuperar-senha',
        '/gestao/redefinir-senha',
        '/gestao/confirm',
      ],
    },
    // Tipos gerados do banco
    types: '~/types/database.types.ts',
  },

  // Auto-importação de componentes sem prefixo de pasta
  components: [
    {
      path: '~/components/ui',
      extensions: ['.vue'],
      pathPrefix: false,
    },
    {
      path: '~/components',
      extensions: ['.vue'],
      pathPrefix: false,
    },
  ],

  // Variáveis de ambiente
  runtimeConfig: {
    // Variáveis privadas (server-only) — nenhuma nesta etapa
    public: {
      // Lidas de NUXT_PUBLIC_SUPABASE_URL e NUXT_PUBLIC_SUPABASE_KEY
      // O módulo @nuxtjs/supabase as configura automaticamente
    },
  },

  // CSS global com tokens shadcn-vue
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' },
        { rel: 'apple-touch-icon', href: '/images/logo.png' },
      ],
    },
  },

})