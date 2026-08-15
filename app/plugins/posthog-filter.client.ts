import posthog from 'posthog-js'

export default defineNuxtPlugin((nuxtApp) => {
  // 1. Camada de segurança estrita: descarte de qualquer evento de /gestao
  posthog.config.before_send = (event: any) => {
    if (!event || !event.properties) return event
    const currentUrl = String(
      event.properties.$current_url
      || (typeof window !== 'undefined' ? window.location.href : ''),
    )
    if (currentUrl.includes('/gestao')) {
      return null
    }
    return event
  }

  // 2. Captura centralizada de $pageview restrita a páginas públicas (sem duplicação)
  const router = useRouter()
  let lastCapturedPath = ''

  const trackPageview = (path: string) => {
    // Excluir 100% qualquer rota do painel administrativo
    if (path.startsWith('/gestao')) return
    // Evitar duplicar captura da mesma rota
    if (path === lastCapturedPath) return

    lastCapturedPath = path
    posthog.capture('$pageview', {
      $current_url: typeof window !== 'undefined' ? window.location.href : path,
    })
  }

  // Captura inicial da primeira página pública carregada
  nuxtApp.hook('app:mounted', () => {
    const route = useRoute()
    trackPageview(route.path)
  })

  // Captura de mudanças posteriores de rotas no Nuxt
  router.afterEach((to) => {
    nextTick(() => {
      trackPageview(to.path)
    })
  })
})
