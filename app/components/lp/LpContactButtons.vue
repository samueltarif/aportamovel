<script setup lang="ts">
import { MessageCircle, Phone } from '@lucide/vue'
import { buildWhatsAppLink } from '~/utils/contactNumbers'
import { useContactShift } from '~/composables/useContactShift'
import { useAnalytics } from '~/composables/useAnalytics'
import { useAdsConversion } from '~/composables/useAdsConversion'
import { useWhatsAppPopup } from '~/composables/useWhatsAppPopup'
import type { CtaLocation } from '~/types/analytics'

const props = withDefaults(defineProps<{
  location: CtaLocation
  /** 'row' = lado a lado; 'stack' = empilhado; 'compact' = botões menores (header) */
  layout?: 'row' | 'stack' | 'compact'
  /** 'dark' para fundos escuros (hero/CTA final) */
  tone?: 'light' | 'dark'
  showNumbers?: boolean
}>(), {
  layout: 'row',
  tone: 'light',
  showNumbers: true,
})

const { contact } = useContactShift()
const { trackPhoneClick, trackWhatsAppClick } = useAnalytics()
const { trackCallConversion } = useAdsConversion()
const { openWhatsAppPopup } = useWhatsAppPopup()

const whatsappHref = computed(() => buildWhatsAppLink(contact.value.whatsappNumber, contact.value.whatsappText))

function onCall() {
  trackPhoneClick({ cta_location: props.location, phone_type: contact.value.phoneType })
  trackCallConversion()
}

// O clique abre o pop-up que pede o número; a conversão do Google Ads só conta quando o
// visitante envia o número e segue para o WhatsApp (ver LpWhatsAppPopup).
function onWhatsApp() {
  trackWhatsAppClick({ cta_location: props.location, channel_type: contact.value.whatsappChannel })
  openWhatsAppPopup(props.location)
}

const wrapperClass = computed(() => {
  if (props.layout === 'stack') return 'flex flex-col gap-3'
  if (props.layout === 'compact') return 'flex items-center gap-2'
  return 'flex flex-col sm:flex-row gap-3'
})

const btnBase = computed(() =>
  props.layout === 'compact'
    ? 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-extrabold min-h-[40px] transition-colors'
    : 'inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm sm:text-base font-extrabold min-h-[52px] shadow-lg transition-all active:scale-[0.98]',
)
</script>

<template>
  <div :class="wrapperClass">
    <a
      :href="`tel:${contact.phoneTel}`"
      :class="[btnBase, 'bg-[#b91c1c] hover:bg-[#991b1b] text-white']"
      :aria-label="`Ligar agora: ${contact.phoneDisplay}`"
      @click="onCall"
    >
      <Phone class="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>
        Ligar agora
        <span v-if="showNumbers" class="hidden sm:inline font-bold opacity-90">· {{ contact.phoneDisplay }}</span>
      </span>
    </a>
    <a
      :href="whatsappHref"
      target="_blank"
      rel="noopener noreferrer"
      :class="[btnBase, 'bg-emerald-500 hover:bg-emerald-600 text-white']"
      :aria-label="`Chamar no WhatsApp: ${contact.whatsappDisplay}`"
      @click.prevent="onWhatsApp"
    >
      <MessageCircle class="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>
        Chamar no WhatsApp
        <span v-if="showNumbers" class="hidden sm:inline font-bold opacity-90">· {{ contact.whatsappDisplay }}</span>
      </span>
    </a>
  </div>
</template>
