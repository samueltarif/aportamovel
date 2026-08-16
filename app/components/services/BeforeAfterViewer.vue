<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PublicMediaItem } from '~/../shared/types/publications'
import MediaPreview from '~/components/media/MediaPreview.vue'

const props = defineProps<{
  medias: PublicMediaItem[]
  title: string
}>()

const beforeMedias = computed(() => props.medias.filter((m) => m.media_stage === 'before'))
const afterMedias = computed(() => props.medias.filter((m) => m.media_stage === 'after'))
const generalMedias = computed(() => props.medias.filter((m) => m.media_stage === 'general'))

const hasBeforeAfter = computed(() => beforeMedias.value.length > 0 && afterMedias.value.length > 0)

// Modo ativo: 'before' | 'after' | 'all'
const currentTab = ref<'before' | 'after' | 'all'>(hasBeforeAfter.value ? 'before' : 'all')
const activeIndex = ref(0)

const displayedMedias = computed(() => {
  if (currentTab.value === 'before') return beforeMedias.value
  if (currentTab.value === 'after') return afterMedias.value
  return props.medias
})

const activeMedia = computed(() => {
  return displayedMedias.value[activeIndex.value] || displayedMedias.value[0]
})

function switchTab(tab: 'before' | 'after' | 'all') {
  currentTab.value = tab
  activeIndex.value = 0
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 sm:p-8 border border-blue-100 shadow-lg space-y-6">
    <!-- Abas Segmentadas Antes & Depois (se aplicável) -->
    <div v-if="hasBeforeAfter" class="flex items-center justify-center gap-3">
      <button
        type="button"
        :class="[
          'px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 border min-h-[44px]',
          currentTab === 'before'
            ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
        ]"
        @click="switchTab('before')"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0" />
        <span>1. Situação Inicial (Antes)</span>
      </button>

      <button
        type="button"
        :class="[
          'px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 border min-h-[44px]',
          currentTab === 'after'
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
        ]"
        @click="switchTab('after')"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0" />
        <span>2. Resultado Final</span>
      </button>
    </div>

    <!-- Mídia Ativa em Destaque (Apenas uma renderizada por vez) -->
    <div v-if="activeMedia" class="space-y-4">
      <div class="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-200 flex items-center justify-center relative">
        <!-- Vídeo -->
        <video
          v-if="activeMedia.media_type === 'video'"
          :key="activeMedia.id"
          :src="activeMedia.url"
          :poster="activeMedia.thumbnail_url"
          controls
          playsinline
          preload="none"
          class="w-full max-h-[580px] object-contain"
          :aria-label="activeMedia.alt_text"
        />

        <!-- Imagem -->
        <img
          v-else
          :key="activeMedia.id"
          :src="activeMedia.url"
          :alt="activeMedia.alt_text"
          class="w-full max-h-[580px] object-contain"
          loading="lazy"
        />
      </div>

      <!-- Legenda e Descrição da Etapa -->
      <div class="max-w-4xl mx-auto text-center space-y-1">
        <p v-if="activeMedia.caption" class="text-sm font-semibold text-slate-800">
          {{ activeMedia.caption }}
        </p>
        <p class="text-xs text-slate-500">
          {{ activeMedia.alt_text }}
        </p>
      </div>
    </div>

    <!-- Miniaturas da Galeria com MediaPreview -->
    <div v-if="displayedMedias.length > 1" class="flex items-center justify-center gap-3 overflow-x-auto pt-4 border-t border-slate-100">
      <button
        v-for="(media, idx) in displayedMedias"
        :key="media.id"
        type="button"
        :class="[
          'w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0',
          activeIndex === idx ? 'border-[#09357a] scale-105 shadow-md ring-2 ring-blue-200' : 'border-slate-200 opacity-60 hover:opacity-100'
        ]"
        @click="activeIndex = idx"
      >
        <MediaPreview
          :src="media.thumbnail_url || media.url"
          :media-type="media.media_type"
          :mime-type="media.mime_type"
          :alt-text="media.alt_text"
          :poster-url="media.thumbnail_url"
          size="full"
          rounded="none"
        />
      </button>
    </div>
  </div>
</template>
