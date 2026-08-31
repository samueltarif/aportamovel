<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-blue-600 selection:text-white">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- Main Content -->
    <main>
      <HeroSection />
      <ServicesSection />
      <MonthlyMaintenanceSection @request-quote="openQuoteModal" />
      <SolutionsShowcaseSection />
      <TechComplementarySection />
      <InfrastructureSection />
      <TestimonialsSection @request-quote="openQuoteModal" />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Modals -->
    <EmergencyModal
      :is-open="isEmergencyOpen"
      @close="isEmergencyOpen = false"
    />

    <QuoteModal
      :is-open="isQuoteOpen"
      :service-name="quoteServiceName"
      :service-slug="quoteServiceSlug"
      @close="isQuoteOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import HeroSection from '~/components/HeroSection.vue'
import ServicesSection from '~/components/ServicesSection.vue'
import MonthlyMaintenanceSection from '~/components/home/MonthlyMaintenanceSection.vue'
import SolutionsShowcaseSection from '~/components/services/SolutionsShowcaseSection.vue'
import TechComplementarySection from '~/components/TechComplementarySection.vue'
import InfrastructureSection from '~/components/InfrastructureSection.vue'
import TestimonialsSection from '~/components/TestimonialsSection.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'
import QuoteModal from '~/components/QuoteModal.vue'

useHead({
  title: 'A Portamóvel - Manutenção de Portões, Serralheria & Segurança para Condomínios',
  meta: [
    {
      name: 'description',
      content: 'Soluções completas em serralheria, recuperação e repintura de gradis, troca de cabo de aço por kit de corrente, manutenção de portões e segurança eletrônica para condomínios.',
    },
  ],
})

const isEmergencyOpen = ref(false)
const isQuoteOpen = ref(false)
const quoteServiceName = ref('Contrato de Manutenção Preventiva')
const quoteServiceSlug = ref('contrato-manutencao-preventiva')

function openQuoteModal(serviceName: string, serviceSlug: string) {
  quoteServiceName.value = serviceName
  quoteServiceSlug.value = serviceSlug
  isQuoteOpen.value = true
}
</script>
