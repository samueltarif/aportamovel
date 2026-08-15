import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAnalytics } from '~/composables/useAnalytics'

export interface SubmitLeadPayload {
  form_id: 'contact_form' | 'quote_modal'
  name: string
  phone: string
  company_or_condominium?: string
  email?: string
  message?: string
  service_slug?: string
  service_name?: string
  turnstile_token: string
  consent: boolean
  _hp_company_title?: string
}

export function useLeadSubmission() {
  const route = useRoute()
  const { trackQuoteFormSubmitted, trackWhatsAppClick } = useAnalytics()

  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const isFallbackActive = ref(false)
  const idempotencyKey = ref(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '')

  const resetIdempotencyKey = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      idempotencyKey.value = crypto.randomUUID()
    }
  }

  const submitLead = async (payload: SubmitLeadPayload): Promise<{ success: boolean; fallback?: boolean }> => {
    if (isSubmitting.value) return { success: false }
    isSubmitting.value = true
    errorMessage.value = null
    isFallbackActive.value = false

    if (!idempotencyKey.value) {
      resetIdempotencyKey()
    }

    const utmSource = typeof route.query.utm_source === 'string' ? route.query.utm_source : undefined
    const utmMedium = typeof route.query.utm_medium === 'string' ? route.query.utm_medium : undefined
    const utmCampaign = typeof route.query.utm_campaign === 'string' ? route.query.utm_campaign : undefined

    try {
      await $fetch('/api/public/leads', {
        method: 'POST',
        body: {
          idempotency_key: idempotencyKey.value,
          name: payload.name,
          phone: payload.phone,
          company_or_condominium: payload.company_or_condominium || undefined,
          email: payload.email || undefined,
          message: payload.message || undefined,
          service_slug: payload.service_slug || undefined,
          service_name: payload.service_name || undefined,
          form_id: payload.form_id,
          source_path: route.path || '/',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          turnstile_token: payload.turnstile_token,
          consent: payload.consent,
          _hp_company_title: payload._hp_company_title || undefined,
        },
      })

      // Disparar eventos analíticos apenas no sucesso sem PII
      trackQuoteFormSubmitted({
        form_id: payload.form_id,
        form_location: payload.form_id === 'contact_form' ? 'contact_page' : 'quote_modal',
        submission_destination: 'whatsapp',
        service_slug: payload.service_slug,
      })

      trackWhatsAppClick({
        cta_location: payload.form_id,
        channel_type: 'commercial',
        service_slug: payload.service_slug,
      })

      isSubmitting.value = false
      return { success: true }
    }
    catch (err: any) {
      isSubmitting.value = false
      // Se for falha de validação Turnstile ou campos inválidos
      if (err.statusCode === 400 || err.statusCode === 403) {
        errorMessage.value = err.data?.message || 'Falha na validação dos dados ou segurança.'
        return { success: false }
      }

      // Falha no servidor ou banco: ativar fallback explícito para WhatsApp
      isFallbackActive.value = true
      errorMessage.value = 'Não foi possível salvar o backup temporário no sistema, mas você pode continuar diretamente pelo WhatsApp.'
      return { success: false, fallback: true }
    }
  }

  return {
    isSubmitting,
    errorMessage,
    isFallbackActive,
    idempotencyKey,
    resetIdempotencyKey,
    submitLead,
  }
}
