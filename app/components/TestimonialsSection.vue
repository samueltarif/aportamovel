<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-[#09357a] tracking-tight">
          Confiança Estabelecida
        </h2>
      </div>

      <!-- Testimonial Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      <div class="mt-12 p-6 sm:p-8 rounded-3xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
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
          class="shrink-0 px-5 py-3 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer"
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
