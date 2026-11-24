import { captureAdClickId } from '~/utils/adClickId'
import { captureFirstVisit, companyWhatsAppNumber, tagWhatsAppUrl } from '~/utils/waTracking'

/**
 * Rastreamento dos cliques no WhatsApp em todo o site público:
 * - guarda a origem da visita (anúncio/UTM e site de origem) em qualquer página;
 * - em todo link <a> para o WhatsApp da empresa, coloca o código de atendimento na
 *   mensagem no momento do clique e registra a ficha do clique.
 * Botões que abrem o WhatsApp por código (formulários, pop-ups) chamam tagWhatsAppUrl diretamente.
 */
function inferCta(a: HTMLAnchorElement): string {
  const tagged = a.closest<HTMLElement>('[data-wa-cta]')?.dataset.waCta
  if (tagged) return tagged
  if (a.closest('footer')) return 'footer'
  if (a.closest('header')) return 'header'
  const section = a.closest('section[id]')?.id
  return section ? `section_${section}` : 'link'
}

export default defineNuxtPlugin((nuxtApp) => {
  const isPublic = () => !window.location.pathname.startsWith('/gestao')

  const captureOrigin = () => {
    if (!isPublic()) return
    captureAdClickId()
    captureFirstVisit()
  }
  captureOrigin()
  nuxtApp.hook('page:finish', captureOrigin)

  document.addEventListener('click', (event) => {
    if (!isPublic()) return
    const a = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a || !companyWhatsAppNumber(a.href)) return
    a.href = tagWhatsAppUrl(a.href, {
      cta: inferCta(a),
      service_slug: a.closest<HTMLElement>('[data-wa-service]')?.dataset.waService || undefined,
    })
  }, { capture: true })
})
