<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * Aviso de cookies (LGPD) integrado ao Consent Mode v2 do Google.
 * Até o visitante escolher, os cookies de anúncio/medição ficam negados
 * (o padrão "denied" é definido no <head> da página, antes do gtag).
 */
const STORAGE_KEY = 'pm_consent'
const visible = ref(false)

type Gtag = (...args: unknown[]) => void

function applyChoice(choice: 'granted' | 'denied') {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  }
  catch {
    // sem armazenamento: a escolha vale só nesta visita
  }
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      ad_storage: choice,
      ad_user_data: choice,
      ad_personalization: choice,
      analytics_storage: choice,
    })
  }
  window.dispatchEvent(new CustomEvent('pm-consent', { detail: choice }))
  visible.value = false
}

onMounted(() => {
  try {
    visible.value = !window.localStorage.getItem(STORAGE_KEY)
  }
  catch {
    visible.value = true
  }
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-x-2 bottom-[76px] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md z-[60] rounded-2xl bg-white border border-slate-200 shadow-2xl p-4"
    role="dialog"
    aria-live="polite"
    aria-label="Aviso de cookies"
  >
    <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
      Usamos cookies para medir o resultado dos nossos anúncios e melhorar o atendimento, conforme a LGPD.
      Veja a <NuxtLink to="/politica-de-privacidade" class="font-bold text-[#09357a] underline underline-offset-2">política de privacidade</NuxtLink>.
    </p>
    <div class="mt-3 flex gap-2">
      <button
        type="button"
        class="flex-1 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-sm font-extrabold min-h-[44px] px-4"
        @click="applyChoice('granted')"
      >
        Aceitar
      </button>
      <button
        type="button"
        class="flex-1 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold min-h-[44px] px-4"
        @click="applyChoice('denied')"
      >
        Recusar
      </button>
    </div>
  </div>
</template>
