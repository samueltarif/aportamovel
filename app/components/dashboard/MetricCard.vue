<script setup lang="ts">
import type { Component } from 'vue'

export interface MetricCardProps {
  title: string
  value?: number | string | null
  description: string
  status?: 'ready' | 'loading' | 'unavailable' | 'error'
  change?: number | null
  icon: Component
}

const props = withDefaults(defineProps<MetricCardProps>(), {
  status: 'unavailable',
  value: null,
  change: null,
})
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ title }}</span>
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#09357a]">
          <component :is="icon" class="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <!-- Estado: Loading -->
      <div v-if="status === 'loading'" class="mt-3 space-y-2">
        <div class="h-7 w-20 bg-slate-200 animate-pulse rounded-md" />
        <div class="h-3 w-32 bg-slate-100 animate-pulse rounded-md" />
      </div>

      <!-- Estado: Indisponível / Aguardando Integração (Sem dados falsos) -->
      <div v-else-if="status === 'unavailable'" class="mt-3">
        <div class="text-2xl font-bold text-slate-400">—</div>
        <div class="mt-1 flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full bg-amber-400" />
          <span class="text-xs font-medium text-slate-500">Aguardando integração</span>
        </div>
      </div>

      <!-- Estado: Erro -->
      <div v-else-if="status === 'error'" class="mt-3">
        <div class="text-sm font-semibold text-red-600">Erro ao carregar dados</div>
      </div>

      <!-- Estado: Pronto (Valor Real) -->
      <div v-else class="mt-3">
        <div class="text-2xl font-extrabold text-slate-900">{{ value }}</div>
        <div v-if="change !== null" class="mt-1 text-xs font-medium" :class="change >= 0 ? 'text-emerald-600' : 'text-red-600'">
          {{ change >= 0 ? '+' : '' }}{{ change }}% no período
        </div>
      </div>
    </div>

    <p class="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
      {{ description }}
    </p>
  </div>
</template>
