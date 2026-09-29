<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-left sm:text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-[#09357a] text-xs font-bold uppercase tracking-wider mb-2.5">
          <span>Depoimentos &amp; Reconhecimento</span>
        </div>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#09357a] tracking-tight">
          Confiança Estabelecida
        </h2>
        <div class="w-16 h-1 bg-gradient-to-r from-[#09357a] to-[#b91c1c] rounded-full mx-0 sm:mx-auto mt-2.5 mb-3" />
      </div>

      <!-- Testimonial Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <TestimonialCard
          quote="A agilidade no atendimento de emergência no final de semana salvou a segurança do nosso acesso de garagem. Equipe técnica impecável."
          author="Condomínio Residencial Jardins - Síndico Roberto M."
        />

        <TestimonialCard
          quote="Desde a reforma e manutenção dos nossos portões pela A Portamóvel, o acesso nunca mais ficou travado. A manutenção preventiva faz toda a diferença."
          author="Edifício Comercial Prime Tower - Administração"
        />
      </div>

      <!-- Subtle Final Callout for Monthly Maintenance -->
      <div class="mt-12 p-5 sm:p-8 rounded-3xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 text-left">
        <div class="space-y-1">
          <h3 class="text-base sm:text-lg font-bold text-[#09357a]">
            Seu condomínio precisa de acompanhamento recorrente?
          </h3>
          <p class="text-xs sm:text-sm text-slate-600">
            Conheça nossos contratos de manutenção preventiva com vistorias mensais programadas.
          </p>
        </div>
        <button
          type="button"
          class="w-full sm:w-auto shrink-0 px-5 py-3 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer min-h-[44px] text-center"
          @click="$emit('request-quote', 'Contrato de Manutenção Preventiva', 'contrato-manutencao-preventiva')"
        >
          Solicitar Proposta
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TestimonialCard from './TestimonialCard.vue'

defineEmits<{
  (e: 'request-quote', serviceName: string, serviceSlug: string): void
}>()
</script>
