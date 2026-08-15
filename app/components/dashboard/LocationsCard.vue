<script setup lang="ts">
import type { LocationItem, SectionStatus } from '~~/shared/types/adminAnalytics'

defineProps<{
  locations: LocationItem[]
  status: SectionStatus
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Distribuição Geográfica</h3>
          <p class="text-xs text-slate-500 mt-0.5">Cidades e regiões com maior concentração de visitantes.</p>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="status === 'loading'" class="space-y-2.5">
        <div v-for="i in 3" :key="i" class="h-8 w-full bg-slate-100/80 animate-pulse rounded-md" />
      </div>

      <!-- Erro ou Indisponível -->
      <div v-else-if="status === 'error' || status === 'unavailable'" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Dados de localização temporariamente indisponíveis.</p>
      </div>

      <!-- Vazio -->
      <div v-else-if="!locations.length" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Nenhum dado geográfico registrado no período.</p>
      </div>

      <!-- Lista de Cidades -->
      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="(loc, idx) in locations"
          :key="idx"
          class="flex items-center justify-between py-2.5 text-xs hover:bg-slate-50/50 transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-700">{{ loc.city }}</span>
            <span v-if="loc.state" class="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
              {{ loc.state }}
            </span>
          </div>
          <span class="font-bold text-slate-900">
            {{ loc.visitors }} <span class="text-[10px] font-normal text-slate-400">visitantes</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Disclaimer Geográfico Legal e Técnico -->
    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Localização aproximada baseada no IP de acesso público.</span>
    </div>
  </div>
</template>
