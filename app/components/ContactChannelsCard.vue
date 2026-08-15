<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics'

const { trackWhatsAppClick, trackPhoneClick } = useAnalytics()
</script>

<template>
  <div class="space-y-6">
    <!-- Block 1: Central de Atendimento (Dark Blue Card) -->
    <div class="bg-[#09357a] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
      <div class="flex items-center space-x-3 mb-5">
        <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-200">
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-lg text-white">
            Central de Atendimento
          </h3>
          <p class="text-xs text-blue-200 uppercase font-semibold tracking-wider">
            Assistência Técnica 24h
          </p>
        </div>
      </div>

      <!-- Telephones Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 py-2 border-y border-blue-400/20">
        <a
          href="tel:1139910279"
          class="flex items-center justify-center sm:justify-start text-sm sm:text-base font-extrabold text-white hover:text-blue-200 transition-colors min-h-[48px] px-2"
          @click="trackPhoneClick({ cta_location: 'contact_page', phone_type: 'fixed_primary' })"
        >
          (11) 3991-0279
        </a>
        <a
          href="tel:1139910280"
          class="flex items-center justify-center sm:justify-start text-sm sm:text-base font-extrabold text-white hover:text-blue-200 transition-colors min-h-[48px] px-2"
          @click="trackPhoneClick({ cta_location: 'contact_page', phone_type: 'fixed_secondary' })"
        >
          (11) 3991-0280
        </a>
      </div>

      <!-- WhatsApp Direct Highlight Button -->
      <div class="mt-4 pt-2">
        <a
          href="https://wa.me/5511912984416?text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20t%C3%A9cnico%20via%20WhatsApp."
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 min-h-[52px]"
          @click="trackWhatsAppClick({ cta_location: 'contact_page', channel_type: 'commercial' })"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
          <span>WhatsApp: (11) 91298-4416</span>
        </a>
      </div>
    </div>

    <!-- Block 2: Location Info Card -->
    <div class="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 shadow-xs">
      <!-- Location -->
      <div class="flex items-start space-x-4">
        <div class="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-[#09357a] flex-shrink-0 shadow-xs">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-black uppercase text-gray-500 tracking-wider">Sede Operacional</p>
          <p class="text-sm font-bold text-gray-900 mt-0.5">Rua Manoel Ramos, 26</p>
          <p class="text-xs text-gray-600">Jd. Maristela - Freguesia do Ó</p>
          <p class="text-xs text-gray-600">São Paulo - SP</p>
        </div>
      </div>
    </div>

    <!-- Block 3: Interactive Location Map Card -->
    <div class="relative rounded-2xl overflow-hidden shadow-md border border-blue-100 group">
      <img
        src="/images/location_map.png"
        alt="Mapa da Sede Operacional A Portamóvel"
        class="w-full h-40 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-4">
        <a
          href="https://maps.google.com/?q=Rua+Manoel+Ramos+26+Freguesia+do+O+Sao+Paulo"
          target="_blank"
          rel="noopener noreferrer"
          class="px-4 py-2 bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-2"
        >
          <span>Visualizar no Mapa</span>
        </a>
        <a
          href="https://maps.google.com/?q=Rua+Manoel+Ramos+26+Freguesia+do+O+Sao+Paulo"
          target="_blank"
          class="p-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white transition-all shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>
