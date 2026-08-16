<script setup lang="ts">
import type { ServiceMedia } from '~/../shared/types/publications'
import MediaPreview from '~/components/media/MediaPreview.vue'

defineProps<{
  medias: ServiceMedia[]
}>()

defineEmits<{
  (e: 'move-up', index: number): void
  (e: 'move-down', index: number): void
  (e: 'set-cover', mediaId: string): void
  (e: 'delete-media', mediaId: string): void
}>()
</script>

<template>
  <div class="space-y-3">
    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Mídias Vinculadas</h4>

    <div v-if="medias.length === 0" class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
      Nenhuma mídia cadastrada ainda. Adicione fotos ou vídeos acima.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="(media, index) in medias"
        :key="media.id"
        class="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
      >
        <div class="flex items-center space-x-3 min-w-0">
          <MediaPreview
            :src="(media as any).url || (media as any).thumbnail_url"
            :media-type="media.media_type"
            :mime-type="media.mime_type"
            :alt-text="media.alt_text"
            :poster-url="(media as any).thumbnail_url"
            size="xs"
            rounded="md"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                v-if="media.is_cover"
                class="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold uppercase"
              >
                Capa
              </span>
              <span class="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                {{ media.media_stage === 'before' ? 'Antes' : media.media_stage === 'after' ? 'Depois' : 'Geral' }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono uppercase">{{ media.media_type }}</span>
            </div>
            <p class="text-xs font-medium text-slate-800 truncate mt-0.5">{{ media.alt_text }}</p>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 flex-shrink-0">
          <!-- Reordenar para cima -->
          <button
            type="button"
            :disabled="index === 0"
            class="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
            title="Mover para cima"
            @click="$emit('move-up', index)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
          </button>

          <!-- Reordenar para baixo -->
          <button
            type="button"
            :disabled="index === medias.length - 1"
            class="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
            title="Mover para baixo"
            @click="$emit('move-down', index)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
          </button>

          <!-- Definir Capa -->
          <button
            v-if="!media.is_cover"
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-all cursor-pointer active:scale-95 min-h-[32px]"
            @click="$emit('set-cover', media.id)"
          >
            Capa
          </button>

          <!-- Excluir Mídia -->
          <button
            type="button"
            class="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Excluir mídia"
            @click="$emit('delete-media', media.id)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
