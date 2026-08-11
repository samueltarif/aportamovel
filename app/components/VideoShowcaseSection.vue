<template>
  <section class="py-12 md:py-20 bg-gradient-to-b from-white via-blue-50/30 to-white border-t border-blue-100/60">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title Header -->
      <div class="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <span class="inline-block bg-blue-50 text-[#09357a] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-blue-100">
          Transformação na Prática
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-[#09357a] tracking-tight">
          Antes &amp; Resultado Final
        </h2>
        <p class="mt-3 text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
          Veja a evolução técnica e a padronização das instalações realizadas pela equipe A Portamóvel.
        </p>
      </div>

      <!-- Carousel Navigation Tabs -->
      <div class="flex items-center justify-center gap-3 mb-8">
        <button
          @click="currentSlide = 0"
          :class="[
            'px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 border min-h-[44px]',
            currentSlide === 0
              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          ]"
        >
          <span class="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0"></span>
          <span>1. Antes (Situação Inicial)</span>
        </button>

        <button
          @click="currentSlide = 1"
          :class="[
            'px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 border min-h-[44px]',
            currentSlide === 1
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          ]"
        >
          <span class="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0"></span>
          <span>2. Resultado Final</span>
        </button>
      </div>

      <!-- Carousel Container Card -->
      <div class="bg-white rounded-2xl p-5 sm:p-8 border border-blue-100 shadow-lg relative overflow-hidden">
        <!-- Slide 0: ANTES (Vertical 478x850) -->
        <div v-show="currentSlide === 0" class="space-y-6 transition-all duration-300">
          <div class="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-4">
            <div>
              <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Passo 1: Estado Inicial</span>
              </span>
              <h3 class="text-xl font-extrabold text-gray-900 mt-2">
                Portão Danificado e Oxidado (Desgaste Estrutural)
              </h3>
            </div>
            <span class="text-xs text-gray-500 font-mono">Vídeo Vertical (478 × 850)</span>
          </div>

          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Estrutura metálica comprometida por oxidação severa, caindo aos pedaços nas partes inferiores e laterais, trazendo alto risco de travamento e comprometendo a segurança do condomínio.
          </p>

          <!-- Vertical Video Player -->
          <div class="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black shadow-xl border border-gray-200 flex items-center justify-center">
            <video
              src="/videos/antes.mp4"
              controls
              playsinline
              preload="metadata"
              class="w-full max-h-[520px] object-contain"
              aria-label="Vídeo do portão oxidado antes da reforma técnica"
            ></video>
          </div>
        </div>

        <!-- Slide 1: RESULTADO FINAL (Horizontal 848x478) -->
        <div v-show="currentSlide === 1" class="space-y-6 transition-all duration-300">
          <div class="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-4">
            <div>
              <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Passo 2: Resultado Final</span>
              </span>
              <h3 class="text-xl font-extrabold text-gray-900 mt-2">
                Reforma Estrutural e Restauração Completa
              </h3>
            </div>
            <span class="text-xs text-emerald-700/80 font-mono">Vídeo Horizontal (848 × 478)</span>
          </div>

          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Portão totalmente reformado pela A Portamóvel: restauração metálica reforçada, tratamento anti-oxidação, alinhamento de guias e funcionamento automatizado seguro e silencioso.
          </p>

          <!-- Horizontal Video Player -->
          <div class="w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-black shadow-xl border border-emerald-100 flex items-center justify-center">
            <video
              src="/videos/resultado final.mp4"
              controls
              playsinline
              preload="metadata"
              class="w-full aspect-video max-h-[520px] object-contain"
              aria-label="Vídeo do resultado final com a padronização técnica da A Portamóvel"
            ></video>
          </div>
        </div>

        <!-- Carousel Footer Arrows & Indicators -->
        <div class="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
          <button
            @click="currentSlide = 0"
            :disabled="currentSlide === 0"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center space-x-1 min-h-[44px]"
          >
            <span>‹ Anterior (Antes)</span>
          </button>

          <!-- Indicators -->
          <div class="flex items-center space-x-2">
            <button
              @click="currentSlide = 0"
              :class="[
                'w-3 h-3 rounded-full transition-all',
                currentSlide === 0 ? 'bg-[#09357a] w-6' : 'bg-gray-300'
              ]"
              aria-label="Ir para o slide 1 (Antes)"
            ></button>
            <button
              @click="currentSlide = 1"
              :class="[
                'w-3 h-3 rounded-full transition-all',
                currentSlide === 1 ? 'bg-[#09357a] w-6' : 'bg-gray-300'
              ]"
              aria-label="Ir para o slide 2 (Resultado Final)"
            ></button>
          </div>

          <button
            @click="currentSlide = 1"
            :disabled="currentSlide === 1"
            class="px-4 py-2 bg-[#09357a] hover:bg-[#07285c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center space-x-1 min-h-[44px]"
          >
            <span>Próximo (Resultado) ›</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentSlide = ref(0)
</script>
