<script setup lang="ts">
import { computed } from 'vue'
import type { SectionStatus, TopServiceItem } from '~~/shared/types/adminAnalytics'

const props = defineProps<{
  services: TopServiceItem[]
  status: SectionStatus
}>()

const maxViews = computed(() => {
  if (!props.services.length) return 1
  return Math.max(...props.services.map(s => s.views), 1)
})
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Serviços Mais Visualizados</h3>
          <p class="text-xs text-slate-500 mt-0.5">Interesse do público por tipo de solução técnica.</p>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="status === 'loading'" class="space-y-3">
        <div v-for="i in 3" :key="i" class="space-y-1.5">
          <div class="h-4 w-32 bg-slate-100/80 animate-pulse rounded-md" />
          <div class="h-2 w-full bg-slate-100/80 animate-pulse rounded-full" />
        </div>
      </div>

      <!-- Erro ou Indisponível -->
      <div v-else-if="status === 'error' || status === 'unavailable'" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Dados de serviços temporariamente indisponíveis.</p>
      </div>

      <!-- Vazio -->
      <div v-else-if="!services.length" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Nenhuma visualização de serviço registrada no período.</p>
      </div>

      <!-- Ranking de Serviços -->
      <div v-else class="space-y-3">
        <div v-for="s in services" :key="s.serviceSlug" class="space-y-1">
          <div class="flex justify-between items-center text-xs">
            <span class="font-semibold text-slate-700 truncate max-w-[200px]">{{ s.serviceName }}</span>
            <span class="font-bold text-slate-900 ml-2">{{ s.views }} <span class="text-[10px] font-normal text-slate-400">views</span></span>
          </div>
          <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#09357a] rounded-full transition-all duration-500"
              :style="{ width: `${(s.views / maxViews) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
