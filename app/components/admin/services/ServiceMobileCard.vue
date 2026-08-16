<script setup lang="ts">
import type { Service } from '~/../shared/types/services'
import { getServiceIconSvg } from '~/utils/serviceIcons'
import MediaPreview from '~/components/media/MediaPreview.vue'

defineProps<{
  service: Service
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'edit', service: Service): void
  (e: 'activate', service: Service): void
  (e: 'archive', service: Service): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center space-x-3">
        <MediaPreview
          v-if="(service as any).card_image_url || service.card_image_storage_key"
          :src="(service as any).card_image_url || service.card_image_storage_key"
          media-type="image"
          :alt-text="service.name"
          size="xs"
          rounded="md"
        />
        <div v-else class="w-12 h-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path :d="getServiceIconSvg(service.icon_key)"/></svg>
        </div>
        <div>
          <h4 class="font-bold text-slate-800 text-sm leading-snug">{{ service.name }}</h4>
          <p class="text-xs font-mono text-slate-400">{{ service.slug }}</p>
        </div>
      </div>

      <span
        v-if="service.archived_at"
        class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600"
      >
        Arquivado
      </span>
      <span
        v-else-if="service.is_active"
        class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700"
      >
        Ativo
      </span>
      <span
        v-else
        class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700"
      >
        Inativo
      </span>
    </div>

    <p class="text-xs text-slate-600 line-clamp-2">
      {{ service.short_description }}
    </p>

    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
      <button
        v-if="!service.is_active && !service.archived_at"
        type="button"
        class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold"
        @click="$emit('activate', service)"
      >
        Ativar
      </button>

      <button
        type="button"
        class="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
        @click="$emit('edit', service)"
      >
        Editar
      </button>

      <button
        v-if="isAdmin && !service.archived_at"
        type="button"
        class="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold"
        @click="$emit('archive', service)"
      >
        Arquivar
      </button>
    </div>
  </div>
</template>
