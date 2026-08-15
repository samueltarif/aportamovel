import posthog from 'posthog-js'
import type {
  WhatsAppClickProps,
  PhoneClickProps,
  ServiceViewProps,
  QuoteFormStartedProps,
  QuoteFormSubmittedProps,
  FormId,
} from '~/types/analytics'
import { BLOCKED_PII_KEYS } from '~/types/analytics'

export function useAnalytics() {
  const route = useRoute()

  // 1. Obter estritamente o path da rota atual (sem query string ou hash)
  const getPagePath = (): string => route.path

  // 2. Sanitizador runtime contra vazamento de PII e exclusão de undefined
  const sanitizePayload = (payload: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) continue
      const lowerKey = key.toLowerCase()
      if (BLOCKED_PII_KEYS.some(blocked => lowerKey.includes(blocked))) {
        console.warn(`[Analytics] Propriedade bloqueada por PII descartada: ${key}`)
        continue
      }
      cleaned[key] = value
    }
    return cleaned
  }

  // 3. Verificação de segurança: proibir envio em rotas /gestao ou SSR
  const isExcluded = (): boolean => {
    if (!import.meta.client) return true
    return route.path.startsWith('/gestao')
  }

  // 4. Obter a instância ativa do PostHog (via composable oficial ou singleton)
  const getPostHogClient = () => {
    if (!import.meta.client) return null
    try {
      const client = typeof usePostHog === 'function' ? usePostHog() : null
      if (client && typeof client.capture === 'function') return client
    }
    catch (e) {
      // Fallback para o módulo posthog-js
    }
    if (posthog && typeof posthog.capture === 'function') return posthog
    return null
  }

  const safeCapture = (eventName: string, properties: Record<string, any>) => {
    if (isExcluded()) return
    const ph = getPostHogClient()
    if (!ph) return

    try {
      const cleanProps = sanitizePayload(properties)
      // Forçar envio instantâneo via sendBeacon sem depender da fila batch
      ph.capture(eventName, cleanProps, { transport: 'sendBeacon', send_instantly: true })
    }
    catch (err) {
      // Falhar silenciosamente sem afetar a navegação do usuário
    }
  }

  // Controle de estado para quote_form_started (uma vez por tentativa)
  const formStartedState = useState<Record<string, boolean>>('analytics_forms_started', () => ({}))

  const trackWhatsAppClick = (data: Omit<WhatsAppClickProps, 'page_path'> & { page_path?: string }) => {
    safeCapture('whatsapp_click', {
      page_path: data.page_path || getPagePath(),
      cta_location: data.cta_location,
      channel_type: data.channel_type,
      service_slug: data.service_slug,
    })
  }

  const trackPhoneClick = (data: Omit<PhoneClickProps, 'page_path'> & { page_path?: string }) => {
    safeCapture('phone_click', {
      page_path: data.page_path || getPagePath(),
      cta_location: data.cta_location,
      phone_type: data.phone_type,
    })
  }

  const trackServiceView = (data: Omit<ServiceViewProps, 'page_path'> & { page_path?: string }) => {
    const slug = (data.service_slug || '').trim()
    const name = (data.service_name || '').trim()
    if (!slug || slug === 'null' || slug === 'undefined') return
    if (!name || name === 'null' || name === 'undefined') return

    safeCapture('service_view', {
      page_path: data.page_path || getPagePath(),
      service_slug: slug,
      service_name: name,
      interaction_type: data.interaction_type,
    })
  }

  const trackQuoteFormStarted = (data: Omit<QuoteFormStartedProps, 'page_path'> & { page_path?: string }) => {
    const formId = data.form_id
    if (formStartedState.value[formId]) return
    formStartedState.value[formId] = true

    safeCapture('quote_form_started', {
      page_path: data.page_path || getPagePath(),
      form_id: data.form_id,
      form_location: data.form_location,
    })
  }

  const resetFormStarted = (formId: FormId) => {
    formStartedState.value[formId] = false
  }

  const trackQuoteFormSubmitted = (data: Omit<QuoteFormSubmittedProps, 'page_path'> & { page_path?: string }) => {
    safeCapture('quote_form_submitted', {
      page_path: data.page_path || getPagePath(),
      form_id: data.form_id,
      form_location: data.form_location,
      submission_destination: data.submission_destination,
      service_slug: data.service_slug,
    })
    resetFormStarted(data.form_id)
  }

  return {
    trackWhatsAppClick,
    trackPhoneClick,
    trackServiceView,
    trackQuoteFormStarted,
    resetFormStarted,
    trackQuoteFormSubmitted,
  }
}
