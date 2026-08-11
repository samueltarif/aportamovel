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
          quote="Desde a modernização do nosso CFTV pela A Portamóvel, o sistema nunca ficou fora do ar. A manutenção preventiva faz toda a diferença."
          author="Edifício Comercial Prime Tower - Administração"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TestimonialCard from './TestimonialCard.vue'
</script>
