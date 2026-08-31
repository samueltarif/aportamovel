<script setup lang="ts">
import SolutionsShowcaseCarousel from '~/components/services/SolutionsShowcaseCarousel.vue'
</script>

<template>
  <section class="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden border-b border-slate-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-10 md:mb-14">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#09357a] text-[11px] font-extrabold uppercase tracking-widest mb-3">
          <span>CATÁLOGO TÉCNICO DETALHADO</span>
        </div>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#09357a] tracking-tight uppercase">
          Conheça Nossas Soluções Especializadas
        </h2>
        <p class="mt-3 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
          Entenda como cada serviço técnico da A Portamóvel soluciona problemas recorrentes, elimina custos de quebras emergenciais e valoriza a segurança do seu condomínio.
        </p>
      </div>

      <!-- Interactive Showcase Carousel -->
      <SolutionsShowcaseCarousel />
    </div>
  </section>
</template>
