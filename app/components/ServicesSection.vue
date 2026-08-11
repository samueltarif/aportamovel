<template>
  <section id="servicos" class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-[#09357a] tracking-tight">
          Áreas de Atuação
        </h2>
        <p class="mt-3 text-base sm:text-lg text-gray-600 font-medium">
          Sistemas integrados de alta disponibilidade para controle e monitoramento contínuo.
        </p>
      </div>

      <!-- Grid of Service Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- CFTV -->
        <ServiceCard
          title="CFTV"
          :items="[
            'Monitoramento HD/IP',
            'Gravação em Nuvem',
            'Manutenção Preventiva'
          ]"
        >
          <template #icon>
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </template>
        </ServiceCard>

        <!-- Controle de Acesso -->
        <ServiceCard
          title="Controle de Acesso"
          :items="[
            'Biometria Facial',
            'Catracas e Cancelas',
            'Relatórios em Tempo Real'
          ]"
        >
          <template #icon>
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 13.92 3 12 3c-1.91 0-3.65.42-5.58 1.41-.25.13-.56.03-.69-.22-.13-.24-.03-.55.22-.68C7.9 2.49 9.82 2 12 2c2.18 0 4.1.49 6.04 1.48.25.13.35.43.22.68-.09.18-.27.31-.45.31zm-1.2 3.01c-.11 0-.22-.03-.33-.1C14.93 6.57 13.5 6.25 12 6.25c-1.51 0-2.93.32-4.28 1.13-.24.14-.55.06-.69-.18-.14-.24-.06-.55.18-.69C8.74 5.61 10.3 5.25 12 5.25c1.7 0 3.26.36 4.79 1.26.24.14.32.45.18.69-.09.15-.25.24-.42.24zM12 9c-3.17 0-5.75 2.58-5.75 5.75 0 1.95.83 3.82 2.29 5.12.21.19.22.5.03.71-.19.21-.5.22-.71.03-1.68-1.5-2.61-3.65-2.61-5.86C5.25 10.92 8.27 7.9 12 7.9s6.75 3.02 6.75 6.85c0 1.28-.24 2.55-.7 3.75-.09.24-.37.37-.62.28-.24-.09-.37-.36-.28-.61.4-1.07.6-2.2.6-3.42C17.75 11.58 15.17 9 12 9z"/>
            </svg>
          </template>
        </ServiceCard>

        <!-- Interfonia -->
        <ServiceCard
          title="Interfonia"
          :items="[
            'Centrais Digitais',
            'Cabeamento Estruturado',
            'Integração com Portaria'
          ]"
        >
          <template #icon>
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </template>
        </ServiceCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ServiceCard from './ServiceCard.vue'
</script>
