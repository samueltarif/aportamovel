/**
 * Microsoft Clarity (mapa de calor e gravação de sessão) — projeto "A porta Movel".
 *
 * Regras:
 * - Carrega diretamente em todo o site público.
 * - Nunca carrega no painel administrativo (/gestao), igual ao filtro do PostHog.
 */
function loadClarity(clarityId: string) {
  const w = window as any
  if (w.__pmClarityLoaded) return
  if (window.location.pathname.startsWith('/gestao')) return
  w.__pmClarityLoaded = true
  ;(function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] = c[a] || function (...args: unknown[]) { (c[a].q = c[a].q || []).push(args) }
    const t = l.createElement(r) as HTMLScriptElement
    t.async = true
    t.src = `https://www.clarity.ms/tag/${i}`
    const y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(w, document, 'clarity', 'script', clarityId)
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const clarityId = (config.public.clarityId as string) || 'z0fj3kkwv5'
  loadClarity(clarityId)
})
