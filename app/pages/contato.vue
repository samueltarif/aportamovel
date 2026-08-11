<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased">
    <!-- Top Announcement Red Bar -->
    <EmergencyBanner text="ATENDIMENTO EM ATÉ 6 HORAS" />

    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- Contact Page Main Content -->
    <main class="py-12 md:py-20 bg-gradient-to-b from-gray-50 via-white to-blue-50/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Hero Header -->
        <div class="max-w-3xl mb-12">
          <h1 class="text-4xl sm:text-5xl font-extrabold text-[#09357a] tracking-tight mb-4">
            Conexão Direta.
          </h1>
          <p class="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
            Prontidão técnica 24 horas. Preencha o formulário para solicitações formais ou utilize nossos canais diretos para atendimento imediato.
          </p>
        </div>

        <!-- 2 Columns Grid: Form (Left) & Direct Channels (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <!-- Left Column: Form Card -->
          <div class="lg:col-span-7">
            <ContactFormCard />
          </div>

          <!-- Right Column: Channels & Location Card -->
          <div class="lg:col-span-5">
            <ContactChannelsCard />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Emergency Modal -->
    <EmergencyModal :is-open="isEmergencyOpen" @close="isEmergencyOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import EmergencyBanner from '~/components/EmergencyBanner.vue'
import ContactFormCard from '~/components/ContactFormCard.vue'
import ContactChannelsCard from '~/components/ContactChannelsCard.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'

useHead({
  title: 'Contato - A Portamóvel Atendimento Direto',
  meta: [
    {
      name: 'description',
      content: 'Fale diretamente com nossa equipe técnica de plantão 24h. Solicite um orçamento para seu condomínio.'
    }
  ]
})

const isEmergencyOpen = ref(false)
</script>
