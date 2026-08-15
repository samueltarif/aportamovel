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
    '@posthog/nuxt',
  ],

  // Configuração do módulo oficial PostHog
  posthogConfig: {
    publicKey: process.env.NUXT_PUBLIC_POSTHOG_KEY || '',
    host: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    clientConfig: {
      defaults: '2026-05-30',
      capture_pageview: false, // Controle centralizado manual para excluir 100% /gestao
      autocapture: false,
      disable_session_recording: true,
      enable_recording_console_log: false,
      capture_exceptions: false,
      capture_heatmaps: false,
      capture_performance: false,
      disable_surveys: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      respect_dnt: true,
      person_profiles: 'identified_only',
      opt_out_capturing_by_default: !process.env.NUXT_PUBLIC_POSTHOG_KEY && (process.env.NODE_ENV === 'development' && !process.env.NUXT_PUBLIC_POSTHOG_TEST),
    },
  },

  // Configuração do módulo Supabase
  supabase: {
    // Desabilitar o redirecionamento global do Supabase.
    // O site público (home, serviços, sobre-nós, contato) não exige autenticação.
    // Apenas a área administrativa (/gestao) exige login, controlada pelo middleware 'gestao'.
    redirect: false,
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