<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- 5 Key Services Showcase Grid -->
    <ServicesShowcaseSection @select-service="openQuoteModal" />

    <!-- Video Showcase Section (Antes e Resultado Final) -->
    <VideoShowcaseSection />

    <!-- Homologated Technology Section -->
    <ApprovedTechSection />

    <!-- Emergency Red Banner Bar -->
    <EmergencyBanner text="ATENDIMENTO DE EMERGÊNCIA EM ATÉ 6 HORAS" />

    <!-- Footer -->
    <AppFooter />

    <!-- Modals -->
    <EmergencyModal :is-open="isEmergencyOpen" @close="isEmergencyOpen = false" />
    <QuoteModal :is-open="isQuoteOpen" :service-name="selectedService" @close="isQuoteOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import ServicesShowcaseSection from '~/components/ServicesShowcaseSection.vue'
import VideoShowcaseSection from '~/components/VideoShowcaseSection.vue'
import ApprovedTechSection from '~/components/ApprovedTechSection.vue'
import EmergencyBanner from '~/components/EmergencyBanner.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'
import QuoteModal from '~/components/QuoteModal.vue'

useHead({
  title: 'Serviços - A Portamóvel Soluções em Segurança',
  meta: [
    {
      name: 'description',
      content: 'Serralheria Especializada para Condomínios: Manutenção, Reforma, Recuperação e Repintura de Portões e Gradis.'
    }
  ]
})

const isEmergencyOpen = ref(false)
const isQuoteOpen = ref(false)
const selectedService = ref('')

const openQuoteModal = (serviceTitle: string) => {
  selectedService.value = serviceTitle
  isQuoteOpen.value = true
}
</script>
