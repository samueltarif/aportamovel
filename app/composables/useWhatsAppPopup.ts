import type { CtaLocation } from '~/types/analytics'

/** Estado global do pop-up "deixe seu WhatsApp" da landing page. */
export function useWhatsAppPopup() {
  const isOpen = useState<boolean>('lp-wa-popup-open', () => false)
  const origin = useState<CtaLocation | null>('lp-wa-popup-origin', () => null)

  function openWhatsAppPopup(from: CtaLocation) {
    origin.value = from
    isOpen.value = true
  }

  function closeWhatsAppPopup() {
    isOpen.value = false
  }

  return { isOpen, origin, openWhatsAppPopup, closeWhatsAppPopup }
}
