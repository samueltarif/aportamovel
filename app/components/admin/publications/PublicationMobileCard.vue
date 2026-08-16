<script setup lang="ts">
import type { ServicePublication } from '~/../shared/types/publications'

defineProps<{
  publication: ServicePublication
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'edit', pub: ServicePublication): void
  (e: 'publish', pub: ServicePublication): void
  (e: 'archive', pub: ServicePublication): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-[#09357a]">
          {{ (publication as any).service_name || 'Serviço' }}
        </span>
        <h4 class="font-bold text-slate-800 text-sm leading-snug mt-0.5">{{ publication.title }}</h4>
        <p class="text-xs font-mono text-slate-400">{{ publication.slug }}</p>
      </div>

      <span
        v-if="publication.status === 'published'"
        class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700"
      >
        Publicado
      </span>
      <span
        v-else-if="publication.status === 'draft'"
        class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700"
      >
        Rascunho
      </span>
      <span
        v-else
        class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600"
      >
        Arquivado
      </span>
    </div>

    <p class="text-xs text-slate-600 line-clamp-2">
      {{ publication.summary }}
    </p>

    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
      <button
        v-if="publication.status === 'draft'"
        type="button"
        class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold"
        @click="$emit('publish', publication)"
      >
        Publicar
      </button>

      <button
        type="button"
        class="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
        @click="$emit('edit', publication)"
      >
        Mídias
      </button>

      <button
        v-if="isAdmin && publication.status !== 'archived'"
        type="button"
        class="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold"
        @click="$emit('archive', publication)"
      >
        Arquivar
      </button>
    </div>
  </div>
</template>
