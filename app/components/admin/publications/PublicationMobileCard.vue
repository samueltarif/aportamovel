<script setup lang="ts">
import type { ServicePublication } from '~/../shared/types/publications'

defineProps<{
  publication: ServicePublication
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'edit', pub: ServicePublication): void
  (e: 'publish', pub: ServicePublication): void
  (e: 'unpublish', pub: ServicePublication): void
  (e: 'delete', pub: ServicePublication): void
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
        class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center space-x-1"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Publicado</span>
      </span>
      <span
        v-else-if="publication.status === 'draft'"
        class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center space-x-1"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Oculto / Rascunho</span>
      </span>
      <span
        v-else
        class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center space-x-1"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>Arquivado</span>
      </span>
    </div>

    <p class="text-xs text-slate-600 line-clamp-2">
      {{ publication.summary }}
    </p>

    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
      <!-- Botão Publicar / Voltar a Publicar -->
      <button
        v-if="publication.status !== 'published'"
        type="button"
        class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
        title="Mostrar publicação no site"
        @click="$emit('publish', publication)"
      >
        Publicar
      </button>

      <!-- Botão Ocultar -->
      <button
        v-if="publication.status === 'published'"
        type="button"
        class="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold transition-colors cursor-pointer"
        title="Deixar de exibir para os clientes no site"
        @click="$emit('unpublish', publication)"
      >
        Ocultar
      </button>

      <!-- Botão Gerenciar -->
      <button
        type="button"
        class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        @click="$emit('edit', publication)"
      >
        Gerenciar
      </button>

      <!-- Botão Excluir Definitivamente -->
      <button
        type="button"
        class="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold transition-colors cursor-pointer"
        title="Excluir publicação e mídias"
        @click="$emit('delete', publication)"
      >
        Excluir
      </button>
    </div>
  </div>
</template>
