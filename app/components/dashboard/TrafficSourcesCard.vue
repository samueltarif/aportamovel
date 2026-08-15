<script setup lang="ts">
import type { SectionStatus, TrafficSourceItem } from '~~/shared/types/adminAnalytics'

defineProps<{
  sources: TrafficSourceItem[]
  status: SectionStatus
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Origem dos Acessos</h3>
          <p class="text-xs text-slate-500 mt-0.5">Canais de atração por sessões e visitantes únicos.</p>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="status === 'loading'" class="space-y-2.5">
        <div v-for="i in 3" :key="i" class="h-10 w-full bg-slate-100/80 animate-pulse rounded-md" />
      </div>

      <!-- Erro ou Indisponível -->
      <div v-else-if="status === 'error' || status === 'unavailable'" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Dados de tráfego temporariamente indisponíveis.</p>
      </div>

      <!-- Vazio -->
      <div v-else-if="!sources.length" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Nenhum registro de canal de tráfego no período.</p>
      </div>

      <!-- Lista de Canais -->
      <div v-else class="space-y-2.5">
        <div
          v-for="(item, idx) in sources"
          :key="idx"
          class="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg text-xs"
        >
          <div class="min-w-0 pr-2">
            <span class="block font-bold text-slate-800 truncate">{{ item.categoryLabel }}</span>
            <span class="block text-[11px] text-slate-500 truncate">{{ item.source }}</span>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="block font-bold text-slate-900">{{ item.sessions }} <span class="text-[10px] font-normal text-slate-400">sessões</span></span>
            <span class="block text-[10px] text-slate-500">{{ item.uniqueVisitors }} visitantes</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
