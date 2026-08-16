<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalytics } from '~/composables/useAnalytics'
import { usePublicServices } from '~/composables/usePublicServices'
import ServiceCard from '~/components/services/ServiceCard.vue'
import type { PublicServiceItem } from '~/../shared/types/services'

const { trackWhatsAppClick } = useAnalytics()
const { services, loading, fetchServices } = usePublicServices()

onMounted(() => {
  fetchServices({ onlyFeatured: true })
})

function handleRequestQuote(service: PublicServiceItem) {
  trackWhatsAppClick({
    cta_location: 'service_card',
    channel_type: 'commercial',
    service_slug: service.slug,
  })
  const text = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o serviço: ${service.name}.`)
  window.open(`https://wa.me/5511912984416?text=${text}`, '_blank')
}
</script>

<template>
  <section id="servicos" class="py-16 md:py-24 bg-slate-50 border-y border-slate-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h3 class="text-2xl sm:text-3xl font-extrabold text-[#09357a]">
          Serviços de Manutenção &amp; Serralheria Condominial
        </h3>
        <p class="mt-2 text-sm sm:text-base text-slate-600 font-medium">
          Soluções de alta resistência técnica para preservar a segurança e o valor estético do seu imóvel.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading && services.length === 0" class="py-16 text-center">
        <div class="inline-block w-8 h-8 border-4 border-[#09357a] border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- 7 Main Services Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :service="service"
          variant="home"
          @request-quote="handleRequestQuote"
        />
      </div>
    </div>
  </section>
</template>
