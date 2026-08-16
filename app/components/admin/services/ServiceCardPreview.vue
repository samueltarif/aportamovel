<script setup lang="ts">
import type { ServiceIconKey, ServiceAccentVariant } from '~/../shared/types/services'
import { getServiceIconSvg } from '~/utils/serviceIcons'
import MediaPreview from '~/components/media/MediaPreview.vue'

defineProps<{
  name: string
  shortDescription: string
  imageUrl: string | null
  iconKey: ServiceIconKey
  accentVariant: ServiceAccentVariant
}>()
</script>

<template>
  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Prévia do Card Público</p>

    <div class="max-w-[280px] mx-auto bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden flex flex-col justify-between">
      <!-- Imagem com MediaPreview -->
      <div class="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
        <MediaPreview
          :src="imageUrl"
          media-type="image"
          :alt-text="name || 'Prévia do Serviço'"
          aspect-ratio="video"
          rounded="none"
        />
      </div>

      <!-- Ícone Circular -->
      <div class="relative z-10 -mt-5 mx-auto">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md"
          :class="accentVariant === 'red' ? 'bg-[#b91c1c] text-white' : 'bg-[#09357a] text-white'"
        >
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path :d="getServiceIconSvg(iconKey)"/></svg>
        </div>
      </div>

      <!-- Conteúdo -->
      <div class="p-4 text-center space-y-2">
        <h4 class="text-xs font-extrabold text-[#09357a] uppercase tracking-tight line-clamp-1">
          {{ name || 'Nome do Serviço' }}
        </h4>
        <div class="w-8 h-0.5 bg-[#b91c1c] mx-auto" />
        <p class="text-[11px] text-slate-600 font-medium line-clamp-2">
          {{ shortDescription || 'Descrição curta do serviço para exibição no card do catálogo.' }}
        </p>

        <div class="pt-2">
          <span class="inline-block w-full py-1.5 rounded-lg bg-[#09357a] text-white font-bold text-[10px] uppercase">
            Solicitar Orçamento
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
