<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-blue-600 selection:text-white">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- Main Content -->
    <main>
      <HeroSection />
      <ServicesSection />
      <InfrastructureSection />
      <TestimonialsSection />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Emergency Modal -->
    <EmergencyModal
      :is-open="isEmergencyOpen"
      @close="isEmergencyOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import HeroSection from '~/components/HeroSection.vue'
import ServicesSection from '~/components/ServicesSection.vue'
import InfrastructureSection from '~/components/InfrastructureSection.vue'
import TestimonialsSection from '~/components/TestimonialsSection.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'

useHead({
  title: 'A Portamóvel - Segurança Institucional com Precisão Técnica',
  meta: [
    {
      name: 'description',
      content: 'Há quase 40 anos entregando soluções robustas em CFTV, Controle de Acesso e Interfonia para condomínios.'
    }
  ]
})

const isEmergencyOpen = ref(false)
</script>
