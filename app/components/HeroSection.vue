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
          <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#09357a] leading-tight tracking-tight uppercase">
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

import { usePublicHeroSlides } from '~/composables/usePublicHeroSlides'
import HeroCarousel from '~/components/hero/HeroCarousel.vue'

const { effectiveSlides, loading, fetchHeroSlides } = usePublicHeroSlides()

onMounted(() => {
  fetchHeroSlides()
})
</script>
