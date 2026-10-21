<script setup lang="ts">
import { ref, watch } from 'vue'
import { MessageCircle, X } from '@lucide/vue'
import TurnstileWidget from '~/components/security/TurnstileWidget.vue'
import { useWhatsAppPopup } from '~/composables/useWhatsAppPopup'
import { useContactShift } from '~/composables/useContactShift'
import { useLeadSubmission } from '~/composables/useLeadSubmission'
import { useAdsConversion } from '~/composables/useAdsConversion'
import { buildWhatsAppLink } from '~/utils/contactNumbers'
import { buildTrackingLines, formatBrPhone, isValidBrPhone, normalizeBrPhone } from '~~/shared/utils/leadTracking'

/**
 * Pop-up da landing page. Nunca bloqueia o visitante:
 * - "Falar no WhatsApp agora": abre a conversa direto, sem pedir nada.
 * - Número opcional: se o visitante deixar o WhatsApp, o lead é salvo no painel
 *   (/gestao/campanha) e a conversa abre em seguida.
 * Se o salvamento falhar ou demorar, o visitante segue para o WhatsApp mesmo assim.
 */
const { isOpen, origin, closeWhatsAppPopup } = useWhatsAppPopup()
const { contact } = useContactShift()
const { submitLead, resetIdempotencyKey } = useLeadSubmission()
const { trackWhatsAppConversion } = useAdsConversion()

const phone = ref('')
const touched = ref(false)
const sending = ref(false)
const hp = ref('')
const turnstileToken = ref('')
watch(isOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    resetIdempotencyKey()
    touched.value = false
    sending.value = false
  }
})

function onInput(e: Event) {
  const digits = normalizeBrPhone((e.target as HTMLInputElement).value).slice(0, 11)
  let out = digits
  if (digits.length > 2) out = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length > 7) out = `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`
  phone.value = out
}

function whatsappText(): string {
  if (contact.value.shift === 'plantao') {
    return 'EMERGÊNCIA: vim pelo site e preciso de um orçamento/atendimento para o portão do condomínio.\nCondomínio:\nBairro:'
  }
  return 'Olá! Vim pelo site e preciso de um orçamento para o portão do condomínio.\nCondomínio:\nBairro:'
}

function waitForToken(ms: number): Promise<string> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tick = () => {
      if (turnstileToken.value || Date.now() - start > ms) return resolve(turnstileToken.value)
      setTimeout(tick, 150)
    }
    tick()
  })
}

function openWhatsApp(win: Window | null) {
  const link = buildWhatsAppLink(contact.value.whatsappNumber, whatsappText())
  trackWhatsAppConversion()
  if (win && !win.closed) {
    win.location.href = link
  }
  else {
    window.location.href = link
  }
  sending.value = false
  phone.value = ''
  closeWhatsAppPopup()
}

// No computador, abre a aba já no clique (evita bloqueio de pop-up); no celular, redireciona.
function preOpenTab(): Window | null {
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches
  return isTouch ? null : window.open('', '_blank')
}

/** Botão "Falar no WhatsApp agora": vai direto, sem pedir número. */
function goDirect() {
  if (sending.value) return
  // Se o visitante já digitou um número válido, aproveita e salva o lead.
  if (isValidBrPhone(phone.value)) return submit()
  sending.value = true
  openWhatsApp(preOpenTab())
}

async function submit() {
  touched.value = true
  if (!isValidBrPhone(phone.value) || sending.value) return
  sending.value = true
  const win = preOpenTab()

  try {
    const token = await waitForToken(4000)
    const save = submitLead({
      form_id: 'quote_modal',
      name: 'Contato WhatsApp (site)',
      phone: formatBrPhone(phone.value),
      service_name: `WhatsApp · LP Condomínios (${contact.value.shift === 'plantao' ? 'plantão' : 'comercial'})`,
      service_slug: 'whatsapp-lp-condominios',
      message: buildTrackingLines({ canal: 'whatsapp_popup', turno: contact.value.shift }).join('\n'),
      turnstile_token: token || 'sem-token',
      consent: true,
      _hp_company_title: hp.value,
    })
    await Promise.race([save, new Promise(r => setTimeout(r, 5000))])
  }
  catch {
    // segue para o WhatsApp mesmo assim
  }

  openWhatsApp(win)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-popup-title"
      @click.self="closeWhatsAppPopup"
    >
      <div class="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-7 shadow-2xl" :data-origin="origin || ''">
        <button
          type="button"
          class="absolute top-3 right-3 h-11 w-11 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          aria-label="Fechar"
          @click="closeWhatsAppPopup"
        >
          <X class="w-5 h-5" aria-hidden="true" />
        </button>

        <div class="flex items-center gap-3 pr-10">
          <span class="h-11 w-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <MessageCircle class="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="wa-popup-title" class="text-lg font-extrabold text-slate-900 leading-tight">Falar no WhatsApp</h2>
            <p class="text-xs text-slate-500">
              {{ contact.shift === 'plantao' ? 'Plantão de emergência' : 'Atendimento comercial' }} · {{ contact.whatsappDisplay }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-extrabold text-base min-h-[52px] px-5 shadow-lg"
          :disabled="sending"
          @click="goDirect"
        >
          <MessageCircle class="w-5 h-5" aria-hidden="true" />
          {{ sending ? 'Abrindo o WhatsApp...' : 'Falar no WhatsApp agora' }}
        </button>

        <form class="mt-5 pt-4 border-t border-slate-100 space-y-3" novalidate @submit.prevent="submit">
          <label for="wa-popup-phone" class="block text-sm font-bold text-slate-800">
            Prefere garantir o retorno? Deixe seu WhatsApp <span class="font-normal text-slate-500">(opcional)</span>
          </label>
          <div class="flex gap-2">
            <input
              id="wa-popup-phone"
              :value="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel-national"
              placeholder="(11) 91234-5678"
              class="flex-1 min-w-0 px-3.5 py-3 border rounded-xl text-base tracking-wide outline-none focus:ring-2 focus:ring-emerald-500"
              :class="touched && !isValidBrPhone(phone) ? 'border-red-400' : 'border-slate-300'"
              :aria-invalid="touched && !isValidBrPhone(phone)"
              aria-describedby="wa-popup-help"
              @input="onInput"
            >
            <button
              type="submit"
              class="shrink-0 rounded-xl border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 disabled:opacity-70 font-bold text-sm px-4 min-h-[48px]"
              :disabled="sending"
            >
              Enviar
            </button>
          </div>
          <p v-if="touched && !isValidBrPhone(phone)" id="wa-popup-help" class="text-xs font-semibold text-red-600">
            Informe o número com DDD, por exemplo (11) 91234-5678, ou use o botão verde acima.
          </p>

          <!-- Honeypot anti-robô (invisível) -->
          <input v-model="hp" type="text" name="company_title" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">

          <TurnstileWidget
            action="quote_modal"
            appearance="interaction-only"
            @verify="turnstileToken = $event"
            @expire="turnstileToken = ''"
          />

          <p class="text-[11px] text-slate-500 leading-snug">
            Ao enviar seu número, você concorda em ser contatado pela A Portamóvel sobre este atendimento, conforme a
            <NuxtLink to="/politica-de-privacidade" class="underline underline-offset-2">política de privacidade</NuxtLink>.
          </p>
        </form>
      </div>
    </div>
  </Teleport>
</template>
