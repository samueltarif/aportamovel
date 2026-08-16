<script setup lang="ts">
import type { PublicServiceItem } from '~/../shared/types/services'
import { getServiceIconSvg } from '~/utils/serviceIcons'
import MediaPreview from '~/components/media/MediaPreview.vue'

const props = withDefaults(
  defineProps<{
    service: PublicServiceItem
    variant?: 'catalog' | 'home'
  }>(),
  {
    variant: 'catalog',
  }
)

defineEmits<{
  (e: 'request-quote', service: PublicServiceItem): void
  (e: 'view-works', service: PublicServiceItem): void
}>()

function getWhatsappUrl(serviceTitle: string): string {
  const text = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o serviço: ${serviceTitle}.`)
  return `https://wa.me/5511912984416?text=${text}`
}
</script>

<template>
  <!-- VARIANTE 1: CATÁLOGO (/servicos) -->
  <div
    v-if="variant === 'catalog'"
    class="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
  >
    <!-- Imagem Superior com MediaPreview -->
    <div class="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
      <MediaPreview
        :src="service.card_image_url"
        media-type="image"
        :alt-text="service.card_image_alt || service.name"
        aspect-ratio="video"
        rounded="none"
        class="group-hover:scale-105 transition-transform duration-500"
      />
    </div>

    <!-- Ícone Circular Flutuante -->
    <div class="relative z-10 -mt-6 mx-auto">
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 transition-all duration-300"
        :class="service.accent_variant === 'red' ? 'bg-[#b91c1c] text-white' : 'bg-[#09357a] text-white group-hover:bg-[#b91c1c]'"
      >
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path :d="getServiceIconSvg(service.icon_key)" />
        </svg>
      </div>
    </div>

    <!-- Conteúdo do Card -->
    <div class="p-5 sm:p-6 text-center flex flex-col justify-between flex-1 space-y-3">
      <h3 class="text-xs sm:text-sm lg:text-base font-extrabold text-[#09357a] group-hover:text-[#b91c1c] transition-colors duration-300 uppercase tracking-tight leading-snug">
        {{ service.name }}
      </h3>

      <div class="w-10 h-0.5 bg-[#b91c1c] mx-auto" aria-hidden="true" />

      <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
        {{ service.short_description }}
      </p>

      <!-- Ações do Card -->
      <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          class="w-full flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 min-h-[44px]"
          @click="$emit('request-quote', service)"
        >
          <span>Solicitar Orçamento</span>
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <NuxtLink
          v-if="service.has_publications"
          :to="`/servicos?categoria=${service.slug}#trabalhos-realizados`"
          class="w-full sm:w-auto inline-flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#09357a] hover:text-[#07285c] font-bold text-xs transition-colors border border-slate-200/80 min-h-[44px]"
          @click="$emit('view-works', service)"
        >
          <span>Trabalhos</span>
          <span class="text-[10px] bg-[#09357a]/10 px-1.5 py-0.5 rounded-full font-extrabold">{{ service.publications_count }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- VARIANTE 2: HOME (/) -->
  <div
    v-else
    class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
  >
    <div class="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
      <MediaPreview
        :src="service.card_image_url"
        media-type="image"
        :alt-text="service.card_image_alt || service.name"
        aspect-ratio="auto"
        rounded="none"
        class="group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>

    <div class="p-6 flex flex-col justify-between flex-1 space-y-4">
      <div>
        <h4 class="text-base sm:text-lg font-black text-[#09357a] group-hover:text-red-700 transition-colors uppercase tracking-tight leading-snug">
          {{ service.name }}
        </h4>
        <div class="w-12 h-1 bg-red-600 rounded-full my-3" />
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {{ service.description }}
        </p>
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
        <a
          :href="getWhatsappUrl(service.name)"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm min-h-[44px]"
        >
          <span>Solicitar Orçamento</span>
        </a>

        <NuxtLink
          v-if="service.has_publications"
          :to="`/servicos?categoria=${service.slug}#trabalhos-realizados`"
          class="inline-flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#09357a] font-bold text-xs border border-slate-200 min-h-[44px]"
        >
          <span>Trabalhos</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
