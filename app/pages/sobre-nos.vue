<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- About Hero -->
    <AboutHeroSection />

    <!-- Timeline Section (Nossa História) -->
    <CompanyTimelineSection />

    <!-- Values, Mission & Vision Section -->
    <AboutValuesSection />

    <!-- Structure Grid Section -->
    <AboutStructureSection />

    <!-- Red Callout Banner -->
    <EmergencyBanner text="Compromisso de Agilidade: Nosso protocolo exige ATENDIMENTO EM ATÉ 6 HORAS para chamados críticos." />

    <!-- Footer -->
    <AppFooter />

    <!-- Emergency Modal -->
    <EmergencyModal :is-open="isEmergencyOpen" @close="isEmergencyOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import AboutHeroSection from '~/components/AboutHeroSection.vue'
import CompanyTimelineSection from '~/components/CompanyTimelineSection.vue'
import AboutValuesSection from '~/components/AboutValuesSection.vue'
import AboutStructureSection from '~/components/AboutStructureSection.vue'
import EmergencyBanner from '~/components/EmergencyBanner.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'

useHead({
  title: 'Sobre Nós - A Portamóvel Segurança Tecnológica',
  meta: [
    {
      name: 'description',
      content: 'Protegendo condomínios desde 1986. Conheça nossa história, frota própria e laboratório técnico de ponta.'
    }
  ]
})

const isEmergencyOpen = ref(false)
</script>
