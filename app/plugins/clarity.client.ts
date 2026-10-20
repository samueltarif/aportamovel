/**
 * Microsoft Clarity (mapa de calor e gravação de sessão) — projeto "A porta Movel".
 *
 * Regras:
 * - Só carrega depois que o visitante clica em "Aceitar" no aviso de cookies (LGPD),
 *   o mesmo 'pm_consent' usado pelo Consent Mode do Google.
 * - Nunca carrega no painel administrativo (/gestao), igual ao filtro do PostHog.
 */
const CLARITY_ID = 'z0fj3kkwv5'
const STORAGE_KEY = 'pm_consent'

function loadClarity() {
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
  })(w, document, 'clarity', 'script', CLARITY_ID)
}

export default defineNuxtPlugin(() => {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === 'granted') loadClarity()
  }
  catch {
    // sem armazenamento: só carrega se aceitar nesta visita
  }
  window.addEventListener('pm-consent', (e) => {
    if ((e as CustomEvent).detail === 'granted') loadClarity()
  })
})
