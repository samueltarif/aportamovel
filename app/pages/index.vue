<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-blue-600 selection:text-white">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- Main Content -->
    <main>
      <HeroSection />
      <ServicesSection />
      <SolutionsShowcaseSection />
      <TechComplementarySection />
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
import SolutionsShowcaseSection from '~/components/services/SolutionsShowcaseSection.vue'
import TechComplementarySection from '~/components/TechComplementarySection.vue'
import InfrastructureSection from '~/components/InfrastructureSection.vue'
import TestimonialsSection from '~/components/TestimonialsSection.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'

useHead({
  title: 'A Portamóvel - Manutenção de Portões, Serralheria & Segurança para Condomínios',
  meta: [
    {
      name: 'description',
      content: 'Soluções completas em serralheria, recuperação e repintura de gradis, troca de cabo de aço por kit de corrente, manutenção de portões e segurança eletrônica para condomínios.'
    }
  ]
})

const isEmergencyOpen = ref(false)
</script>
