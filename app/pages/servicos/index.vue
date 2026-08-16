<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import ServiceCard from '~/components/services/ServiceCard.vue'
import PublicationsGallery from '~/components/services/PublicationsGallery.vue'
import ApprovedTechSection from '~/components/ApprovedTechSection.vue'
import EmergencyBanner from '~/components/EmergencyBanner.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'
import QuoteModal from '~/components/QuoteModal.vue'
import { usePublicServices } from '~/composables/usePublicServices'
import type { PublicServiceItem } from '~/../shared/types/services'

useHead({
  title: 'Serviços Especializados para Condomínios - A Portamóvel',
  meta: [
    {
      name: 'description',
      content: 'Serralheria Especializada para Condomínios: Manutenção, Reforma, Recuperação e Repintura de Portões e Gradis.',
    },
  ],
})

const isEmergencyOpen = ref(false)
const isQuoteOpen = ref(false)
const selectedService = ref('')

const { services, loading, fetchServices } = usePublicServices()

onMounted(() => {
  fetchServices()
})

const openQuoteModal = (service: PublicServiceItem) => {
  selectedService.value = service.name
  isQuoteOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- Seção de Serviços Principais (5 cards na grade de catálogo) -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14">
          <span class="inline-block bg-blue-50 text-[#09357a] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-blue-100">
            Nossas Especialidades
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#09357a] tracking-tight">
            Serviços para Condomínios
          </h1>
          <div class="w-16 h-1 bg-gradient-to-r from-[#09357a] to-[#b91c1c] rounded-full mx-auto mt-3 mb-4" />
          <p class="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
            Soluções completas com atendimento de emergência em até 6 horas, garantia técnica e tecnologia de ponta.
          </p>
        </div>

        <div v-if="loading" class="py-16 text-center">
          <div class="inline-block w-8 h-8 border-4 border-[#09357a] border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Grade de Cards de Serviços -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
          <ServiceCard
            v-for="service in services.slice(0, 5)"
            :key="service.id"
            :service="service"
            variant="catalog"
            @request-quote="openQuoteModal"
          />
        </div>
      </div>
    </section>

    <!-- Seção Dinâmica de Trabalhos Realizados (Portfólio / Antes e Depois) -->
    <PublicationsGallery :services="services" />

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
