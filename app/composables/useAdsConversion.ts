/**
 * Conversões do Google Ads (gtag).
 * Só dispara se NUXT_PUBLIC_GOOGLE_ADS_ID e o rótulo da conversão estiverem configurados,
 * então é seguro manter em produção antes de a conta estar pronta.
 */
export function useAdsConversion() {
  const config = useRuntimeConfig().public as Record<string, string | undefined>

  const fire = (label?: string) => {
    if (!import.meta.client) return
    const id = config.googleAdsId
    if (!id || !label) return
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag !== 'function') return
    try {
      w.gtag('event', 'conversion', { send_to: `${id}/${label}` })
    }
    catch {
      // nunca quebrar a navegação por causa de tracking
    }
  }

  return {
    trackCallConversion: () => fire(config.googleAdsLabelCall),
    trackWhatsAppConversion: () => fire(config.googleAdsLabelWhatsapp),
    trackFormConversion: () => fire(config.googleAdsLabelForm),
  }
}
