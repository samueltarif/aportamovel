<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      @click.self="$emit('close')"
      role="dialog"
      aria-modal="true"
      aria-label="Atendimento emergencial"
    >
      <div class="bg-white w-full sm:w-[calc(100%-2rem)] sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-red-100 relative max-h-[90dvh] overflow-y-auto">
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="Fechar modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex items-center space-x-3 mb-3 text-[#b91c1c] pr-8">
          <div class="p-2.5 bg-red-100 rounded-full flex-shrink-0">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Atendimento Emergencial</h3>
            <p class="text-xs text-red-600 font-semibold uppercase">Assistência 24 horas</p>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
          Nossa equipe técnica atende emergências de portaria, serralheria, manutenção de portões e recuperação de gradis.
        </p>

        <!-- Section 1: Das 7:00 às 16:00 -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Das 07:00 às 16:00
            </span>
            <span v-if="isDayShift" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span class="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full animate-pulse"></span>
              Ativo agora
            </span>
          </div>

          <div class="space-y-2">
            <!-- WhatsApp Callout -->
            <a
              href="https://wa.me/5511912984416?text=EMERG%C3%8ANCIA%3A%20Preciso%20de%20atendimento%20t%C3%A9cnico%20urgente!"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm min-h-[48px]"
              :class="{ 'ring-2 ring-emerald-500 ring-offset-1': isDayShift }"
            >
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
                <span class="text-xs sm:text-sm font-extrabold">WhatsApp: (11) 91298-4416</span>
              </div>
              <span class="text-xs bg-white text-emerald-700 font-extrabold px-2.5 py-1 rounded-md flex-shrink-0 shadow-xs">Abrir</span>
            </a>

            <!-- Landlines -->
            <a href="tel:1139910280" class="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 text-[#b91c1c] font-bold rounded-xl transition-all border border-red-200 min-h-[44px]">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="text-xs sm:text-sm font-bold">(11) 3991-0280</span>
              </div>
              <span class="text-xs bg-red-600 text-white px-2.5 py-1 rounded-md font-bold">Ligar</span>
            </a>

            <a href="tel:1139910279" class="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 text-[#b91c1c] font-bold rounded-xl transition-all border border-red-200 min-h-[44px]">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="text-xs sm:text-sm font-bold">(11) 3991-0279</span>
              </div>
              <span class="text-xs bg-red-600 text-white px-2.5 py-1 rounded-md font-bold">Ligar</span>
            </a>
          </div>
        </div>

        <!-- Section 2: Após as 16:00 (Plantão) -->
        <div class="pt-3 border-t border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Após as 16:00 (Plantão)
            </span>
            <span v-if="!isDayShift" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span class="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full animate-pulse"></span>
              Ativo agora
            </span>
          </div>

          <div class="p-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-md flex items-center justify-between flex-wrap gap-2" :class="{ 'ring-2 ring-red-500 ring-offset-1': !isDayShift }">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <span class="block text-[11px] font-normal text-red-100 uppercase tracking-wide">Plantão 24h</span>
                <span class="text-sm sm:text-base font-black">(11) 94027-7438</span>
              </div>
            </div>
            <div class="flex items-center space-x-1.5 ml-auto sm:ml-0">
              <a
                href="tel:11940277438"
                class="text-xs bg-white text-red-700 font-extrabold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-xs"
                aria-label="Ligar para plantão"
              >
                Ligar
              </a>
              <a
                href="https://wa.me/5511940277438?text=EMERG%C3%8ANCIA%3A%20Preciso%20de%20atendimento%20t%C3%A9cnico%20de%20plant%C3%A3o!"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs bg-emerald-500 text-white font-extrabold px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-xs flex items-center gap-1"
                aria-label="WhatsApp plantão"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ isOpen: boolean }>()
defineEmits(['close'])

const isDayShift = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

const checkShift = () => {
  const hour = new Date().getHours()
  isDayShift.value = hour >= 7 && hour < 16
}

onMounted(() => {
  checkShift()
  timer = setInterval(checkShift, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

watch(() => props.isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    checkShift()
  }
})
</script>

