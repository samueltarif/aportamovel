<script setup lang="ts">
import type { Component } from 'vue'
import { TrendingUp, TrendingDown } from '@lucide/vue'

export interface MetricCardProps {
  title: string
  value?: number | string | null
  description: string
  status?: 'ready' | 'loading' | 'unavailable' | 'error'
  change?: number | null
  icon: Component
  spark?: number[]
  accent?: string
}

const props = withDefaults(defineProps<MetricCardProps>(), {
  status: 'unavailable',
  value: null,
  change: null,
  spark: () => [],
  accent: '#2563eb',
})

const sparkPath = computed(() => {
  const s = props.spark
  if (s.length < 2) return null
  const max = Math.max(...s, 1)
  const pts = s.map((v, i) => [(i / (s.length - 1)) * 100, 28 - (v / max) * 24] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  return { line, area: `${line} L100,32 L0,32 Z` }
})

const gradId = `g-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)]"
    :title="description"
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
      :style="{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }"
    />

    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{{ title }}</span>
      <component :is="icon" class="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-slate-700" aria-hidden="true" />
    </div>

    <div v-if="status === 'loading'" class="mt-3 space-y-2">
      <div class="h-7 w-16 animate-pulse rounded-md bg-slate-200/70" />
      <div class="h-3 w-24 animate-pulse rounded-md bg-slate-100" />
    </div>

    <div v-else-if="status === 'unavailable'" class="mt-3">
      <div class="text-2xl font-semibold text-slate-300">—</div>
      <div class="mt-1 text-[11px] text-slate-400">Aguardando integração</div>
    </div>

    <div v-else-if="status === 'error'" class="mt-3 text-xs font-medium text-red-600">Erro ao carregar</div>

    <div v-else class="mt-2.5">
      <div class="flex items-end justify-between gap-2">
        <div class="text-[28px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">{{ value ?? 0 }}</div>
        <span
          v-if="change !== null"
          class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
          :class="change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
        >
          <component :is="change >= 0 ? TrendingUp : TrendingDown" class="h-2.5 w-2.5" />
          {{ change >= 0 ? '+' : '' }}{{ change }}%
        </span>
      </div>

      <svg v-if="sparkPath" class="mt-3 h-8 w-full" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="accent" stop-opacity="0.28" />
            <stop offset="100%" :stop-color="accent" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="sparkPath.area" :fill="`url(#${gradId})`" />
        <path :d="sparkPath.line" fill="none" :stroke="accent" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      </svg>
      <div v-else class="mt-3 h-8" />
    </div>
  </div>
</template>
