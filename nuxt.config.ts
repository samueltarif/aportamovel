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
    redirect: false,
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
    // Variáveis privadas (server-only) para consulta segura do PostHog
    posthogPersonalApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '',
    posthogProjectId: process.env.POSTHOG_PROJECT_ID || '559598',
    posthogApiHost: process.env.POSTHOG_API_HOST || 'https://us.posthog.com',

    // Variáveis privadas (server-only) para o módulo de Leads e Turnstile
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || '',
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',
    turnstileAllowedHostnames: process.env.TURNSTILE_ALLOWED_HOSTNAMES || 'aportamovel.com.br,www.aportamovel.com.br',
    leadPrivacyNoticeVersion: process.env.LEAD_PRIVACY_NOTICE_VERSION || '',

    // Variáveis privadas (server-only) para Cloudflare R2 e Cron
    cronSecret: process.env.CRON_SECRET || '',
    r2AccountId: process.env.R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.R2_BUCKET_NAME || '',
    r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL || '',

    // Variáveis privadas (server-only) para Gestão Segura de Administradores
    adminAuthConfirmUrl: process.env.ADMIN_AUTH_CONFIRM_URL || 'http://localhost:3000/auth/confirm',
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,https://www.aportamovel.com.br,https://aportamovel.com.br',
    idempotencyHmacSecret: process.env.ADMIN_IDEMPOTENCY_HMAC_SECRET || 'dev_secret_hmac_must_be_at_least_32_bytes_long_1234567890',

    public: {
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      dynamicServicesEnabled: process.env.NUXT_PUBLIC_DYNAMIC_SERVICES_ENABLED || 'false',
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