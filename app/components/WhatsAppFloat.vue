<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics'

const { trackWhatsAppClick } = useAnalytics()
const whatsappUrl = 'https://wa.me/5511912984416?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20servi%C3%A7os%20da%20A%20Portam%C3%B3vel.'

const handleClick = () => {
  trackWhatsAppClick({
    cta_location: 'floating_button',
    channel_type: 'commercial',
  })
}
</script>

<template>
  <div
    class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center group"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <!-- Tooltip Label (desktop only) -->
    <a
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mr-3 px-3.5 py-2 bg-gray-900/90 hover:bg-gray-900 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur hidden sm:flex items-center space-x-2 transition-all opacity-95 group-hover:opacity-100 pointer-events-none sm:pointer-events-auto"
      tabindex="-1"
      aria-hidden="true"
      @click="handleClick"
    >
      <span class="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-ping flex-shrink-0" />
      <span>Fale conosco no WhatsApp</span>
    </a>

    <!-- Floating WhatsApp Button -->
    <a
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atendimento via WhatsApp: (11) 91298-4416"
      class="relative w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
      @click="handleClick"
    >
      <!-- Pulse Ring (respects prefers-reduced-motion) -->
      <span class="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping opacity-40" />

      <!-- SVG WhatsApp Icon -->
      <svg class="w-6 h-6 sm:w-8 sm:h-8 fill-current relative z-10" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    </a>
  </div>
</template>
