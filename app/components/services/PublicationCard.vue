<script setup lang="ts">
import type { PublicPublicationCard } from '~/../shared/types/publications'
import MediaPreview from '~/components/media/MediaPreview.vue'

defineProps<{
  publication: PublicPublicationCard
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
    <!-- Imagem de Capa / Poster com MediaPreview -->
    <div class="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
      <MediaPreview
        :src="publication.cover_url"
        :media-type="publication.cover_url?.includes('.mp4') || publication.cover_url?.includes('.webm') ? 'video' : 'image'"
        :alt-text="publication.cover_alt || publication.title"
        aspect-ratio="auto"
        rounded="none"
        class="group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Badges Superiores -->
      <div class="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap pointer-events-none">
        <span class="px-2.5 py-1 rounded-md bg-[#09357a]/90 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
          {{ publication.service_name }}
        </span>

        <span
          v-if="publication.has_before_after"
          class="px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs"
        >
          Antes &amp; Depois
        </span>
      </div>

      <!-- Indicador de Vídeo / Mídias -->
      <div class="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-none">
        <span
          v-if="publication.has_video"
          class="w-8 h-8 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center shadow-md"
          title="Contém vídeo demonstrativo"
        >
          <svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </span>

        <span class="px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono font-bold shadow-xs">
          {{ publication.media_count }} {{ publication.media_count === 1 ? 'mídia' : 'mídias' }}
        </span>
      </div>
    </div>

    <!-- Conteúdo do Card -->
    <div class="p-5 flex flex-col justify-between flex-1 space-y-3">
      <div>
        <h4 class="text-base font-bold text-[#09357a] group-hover:text-[#b91c1c] transition-colors leading-snug line-clamp-2">
          {{ publication.title }}
        </h4>

        <p class="mt-2 text-xs sm:text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed">
          {{ publication.summary }}
        </p>
      </div>

      <!-- Botão de Ação -->
      <div class="pt-3 border-t border-slate-100">
        <NuxtLink
          :to="`/servicos/${publication.service_slug}/trabalhos/${publication.slug}`"
          class="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-[#09357a] group-hover:text-[#b91c1c] font-bold text-xs uppercase tracking-wider transition-colors min-h-[44px]"
        >
          <span>Ver Detalhes do Projeto</span>
          <svg class="w-4 h-4 fill-current transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
