<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useAnalytics } from '~/composables/useAnalytics'
import { useLeadSubmission } from '~/composables/useLeadSubmission'
import { buildCommercialWhatsAppUrl } from '~/utils/whatsappUrl'
import { buildWhatsAppLink } from '~/utils/contactNumbers'
import { useAdsConversion } from '~/composables/useAdsConversion'
import { useContactShift } from '~/composables/useContactShift'
import TurnstileWidget from '~/components/security/TurnstileWidget.vue'

const props = defineProps<{
  isOpen: boolean
  serviceName?: string
  serviceSlug?: string
}>()

const emit = defineEmits(['close', 'submitted'])

const { trackServiceView, trackQuoteFormStarted, resetFormStarted } = useAnalytics()
const { isSubmitting, errorMessage, isFallbackActive, submitLead } = useLeadSubmission()
const { trackWhatsAppConversion } = useAdsConversion()
const { contact } = useContactShift()

const form = reactive({
  name: '',
  phone: '',
  condo: '',
  consent: false,
  _hp_company_title: '',
})

const turnstileToken = ref('')
const turnstileWidgetRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

const getSlug = (): string | undefined => {
  if (props.serviceSlug) return props.serviceSlug
  if (!props.serviceName) return undefined
  return props.serviceName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

watch(() => props.isOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }

  if (open) {
    resetFormStarted('quote_modal')
    const slug = getSlug()
    if (props.serviceName && slug) {
      trackServiceView({
        service_name: props.serviceName,
        service_slug: slug,
        interaction_type: 'modal_open',
      })
    }
  }
})

const handleFieldFocus = () => {
  trackQuoteFormStarted({
    form_id: 'quote_modal',
    form_location: 'quote_modal',
  })
}

const getWhatsAppUrl = () => {
  return buildCommercialWhatsAppUrl({
    name: form.name,
    phone: form.phone,
    companyOrCondominium: form.condo,
    serviceName: props.serviceName,
  })
}

// No computador, abre a aba já no clique (evita bloqueio de pop-up); no celular, redireciona.
const preOpenTab = (): Window | null => {
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches
  return isTouch ? null : window.open('', '_blank')
}

const goTo = (win: Window | null, url: string) => {
  if (win && !win.closed) win.location.href = url
  else window.location.href = url
}

// A verificação anti-robô roda invisível; espera no máximo alguns segundos e nunca trava o envio.
const waitForToken = (ms: number): Promise<string> => new Promise((resolve) => {
  const start = Date.now()
  const tick = () => {
    if (turnstileToken.value || Date.now() - start > ms) return resolve(turnstileToken.value)
    setTimeout(tick, 150)
  }
  tick()
})

/** "Falar no WhatsApp agora": abre a conversa direto, sem preencher nada (comercial ou plantão, conforme o horário). */
const goDirect = () => {
  const service = props.serviceName ? `um orçamento de ${props.serviceName}` : 'um orçamento'
  const text = `Olá! Vim pelo site e preciso de ${service} para o portão do condomínio.\nCondomínio:\nBairro:`
  const url = buildWhatsAppLink(contact.value.whatsappNumber, text)
  trackWhatsAppConversion()
  goTo(preOpenTab(), url)
  emit('close')
}

const handleSubmit = async () => {
  if (!form.consent || isSubmitting.value) return

  const win = preOpenTab()
  const token = await waitForToken(4000)
  const slug = getSlug()
  const res = await submitLead({
    form_id: 'quote_modal',
    name: form.name,
    phone: form.phone,
    company_or_condominium: form.condo,
    service_name: props.serviceName,
    service_slug: slug,
    turnstile_token: token || 'sem-token',
    consent: true,
    _hp_company_title: form._hp_company_title,
  })

  // Salvo ou não, o visitante segue para o WhatsApp: nunca perdemos o contato por erro técnico.
  if (res.success) emit('submitted')
  else {
    turnstileWidgetRef.value?.reset()
    turnstileToken.value = ''
  }
  goTo(win, getWhatsAppUrl())
  setTimeout(() => {
    emit('close')
  }, 400)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Modal de orçamento"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white w-full sm:w-[calc(100%-2rem)] sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl border border-blue-100 relative max-h-[90dvh] overflow-y-auto"
      >
        <button
          class="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="Fechar modal"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="mb-5 sm:mb-6 pr-8">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Orçamento Rápido
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-[#09357a] mt-2 leading-tight">
            {{ serviceName ? `Solicitar: ${serviceName}` : 'Solicite um Orçamento' }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            Fale agora pelo WhatsApp ou deixe seus dados para retornarmos.
          </p>
        </div>

        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base min-h-[52px] px-5 shadow-md mb-5"
          @click="goDirect"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z" />
          </svg>
          Falar no WhatsApp agora
        </button>

        <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-4">
          ou deixe seus dados para retornarmos
        </p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <input
            v-model="form._hp_company_title"
            type="text"
            name="_hp_company_title"
            tabindex="-1"
            autocomplete="off"
            class="opacity-0 absolute -z-10 h-0 w-0 pointer-events-none"
          >

          <div>
            <label class="block text-xs font-bold uppercase text-gray-700 mb-1" for="modal-name">Nome Completo</label>
            <input
              id="modal-name"
              v-model="form.name"
              type="text"
              required
              autocomplete="name"
              placeholder="Ex: João da Silva"
              class="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#09357a] outline-none"
              @focus="handleFieldFocus"
            >
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-700 mb-1" for="modal-phone">Telefone / WhatsApp</label>
            <input
              id="modal-phone"
              v-model="form.phone"
              type="tel"
              required
              autocomplete="tel"
              placeholder="(11) 99999-9999"
              class="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#09357a] outline-none"
              @focus="handleFieldFocus"
            >
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-700 mb-1" for="modal-condo">Condomínio / Empresa</label>
            <input
              id="modal-condo"
              v-model="form.condo"
              type="text"
              autocomplete="organization"
              placeholder="Ex: Condomínio Alpha"
              class="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#09357a] outline-none"
              @focus="handleFieldFocus"
            >
          </div>

          <TurnstileWidget
            ref="turnstileWidgetRef"
            action="quote_modal"
            appearance="interaction-only"
            @verify="turnstileToken = $event"
            @expire="turnstileToken = ''"
            @error="turnstileToken = ''"
          />

          <div class="flex items-start space-x-2.5">
            <input
              id="modal-consent"
              v-model="form.consent"
              type="checkbox"
              required
              class="mt-1 w-4 h-4 rounded text-[#09357a] border-gray-300 focus:ring-[#09357a] cursor-pointer"
            >
            <label for="modal-consent" class="text-xs text-gray-600 leading-tight cursor-pointer">
              Li e concordo com o uso dos meus dados para o retorno desta solicitação.
            </label>
          </div>

          <div v-if="errorMessage" class="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-2">
            <p>{{ errorMessage }}</p>
            <a
              v-if="isFallbackActive"
              :href="getWhatsAppUrl()"
              target="_blank"
              class="inline-block px-3 py-1.5 bg-[#09357a] hover:bg-[#07285c] text-white font-bold rounded-lg transition-colors"
            >
              Continuar pelo WhatsApp mesmo assim →
            </a>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || !form.consent"
            class="w-full py-3.5 bg-[#09357a] text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#07285c] transition-all shadow-md mt-2 flex items-center justify-center space-x-2 min-h-[52px] disabled:opacity-50"
          >
            <span>{{ isSubmitting ? 'Enviando...' : 'Enviar meus dados' }}</span>
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>
