<template>
  <section id="home" class="py-10 md:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
    <!-- Opaque neutral tool background icon (no lado esquerdo, tom opaco sutil) -->
    <div class="absolute -left-10 sm:-left-16 top-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none text-slate-400 select-none z-0 hidden sm:block">
      <svg class="w-[450px] h-[450px] sm:w-[550px] sm:h-[550px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.3z"/>
      </svg>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <!-- Left Content Column -->
        <div class="lg:col-span-6 space-y-5 sm:space-y-6">
          <!-- Red Badge -->
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#b91c1c] text-white text-xs font-black uppercase tracking-widest shadow-sm">
            <span>SERRALHERIA ESPECIALIZADA</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-[#09357a] leading-tight tracking-tight uppercase">
            MANUTENÇÃO • REFORMA • RECUPERAÇÃO • REPINTURA
          </h1>

          <!-- Subtitle -->
          <div class="space-y-3">
            <p class="text-base sm:text-lg text-[#b91c1c] font-extrabold tracking-wide">
              "Não Substitua. Recupere, renove e valorize o patrimônio do seu condomínio."
            </p>
            <p class="text-base sm:text-lg text-gray-600 leading-relaxed font-medium">
              Com tecnologia, experiência e uma equipe especializada, a <strong class="text-gray-900 font-bold">Aportamóvel</strong> oferece serviços que garantem mais segurança, funcionalidade, durabilidade e tranquilidade no dia a dia do seu condomínio.
            </p>
          </div>

          <!-- Red Tactical Commitment Banner -->
          <div class="bg-[#d97768] text-white rounded-xl p-4 sm:p-5 shadow-lg border border-red-300 flex items-center space-x-3 sm:space-x-4">
            <!-- Lottie Siren Animation -->
            <div class="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
              <ClientOnly>
                <DotLottieVue
                  style="width: 100%; height: 100%;"
                  autoplay
                  loop
                  src="/animation/Siren animation.json"
                />
              </ClientOnly>
            </div>

            <div class="min-w-0">
              <h3 class="font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                COMPROMISSO TÁTICO
              </h3>
              <p class="text-sm font-semibold text-white/95 mt-0.5">
                Atendimento Emergencial em até 6 horas.
              </p>
            </div>
          </div>

          <!-- 3 Key Pillars Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <!-- Pillar 1: Mais Segurança -->
            <div class="flex items-center space-x-3 p-2.5 rounded-xl bg-blue-50/90 border border-blue-100 shadow-sm hover:border-blue-200 transition-colors">
              <div class="w-9 h-9 rounded-lg bg-[#09357a] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <h4 class="font-black text-xs text-[#09357a] uppercase tracking-tight leading-tight">
                  MAIS SEGURANÇA
                </h4>
                <p class="text-[11px] font-semibold text-gray-600 leading-tight">
                  para o seu condomínio
                </p>
              </div>
            </div>

            <!-- Pillar 2: Maior Durabilidade -->
            <div class="flex items-center space-x-3 p-2.5 rounded-xl bg-blue-50/90 border border-blue-100 shadow-sm hover:border-blue-200 transition-colors">
              <div class="w-9 h-9 rounded-lg bg-[#09357a] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <h4 class="font-black text-xs text-[#09357a] uppercase tracking-tight leading-tight">
                  MAIOR DURABILIDADE
                </h4>
                <p class="text-[11px] font-semibold text-gray-600 leading-tight">
                  e menos imprevistos
                </p>
              </div>
            </div>

            <!-- Pillar 3: Valorização -->
            <div class="flex items-center space-x-3 p-2.5 rounded-xl bg-blue-50/90 border border-blue-100 shadow-sm hover:border-blue-200 transition-colors">
              <div class="w-9 h-9 rounded-lg bg-[#09357a] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M15 11V5l-3-3-3 3v6H3v10h18V11h-6zm-4-7.17l1-1 1 1V9h-2V3.83zM5 13h4v2H5v-2zm0 4h4v2H5v-2zm14 2h-4v-2h4v2zm0-4h-4v-2h4v2zm-6 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <h4 class="font-black text-xs text-[#09357a] uppercase tracking-tight leading-tight">
                  VALORIZAÇÃO
                </h4>
                <p class="text-[11px] font-semibold text-gray-600 leading-tight">
                  do patrimônio
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Image Column (Carrossel Dinâmico de Fotos dos Serviços) -->
        <div class="lg:col-span-6">
          <HeroCarousel :slides="effectiveSlides" :loading="loading" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { usePublicHeroSlides } from '~/composables/usePublicHeroSlides'
import HeroCarousel from '~/components/hero/HeroCarousel.vue'

const { effectiveSlides, loading, fetchHeroSlides } = usePublicHeroSlides()

onMounted(() => {
  fetchHeroSlides()
})
</script>
