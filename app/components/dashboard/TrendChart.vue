<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyticsTrendPoint, SectionStatus } from '~~/shared/types/adminAnalytics'

const props = defineProps<{
  points: AnalyticsTrendPoint[]
  status: SectionStatus
}>()

const maxVal = computed(() => {
  if (!props.points.length) return 10
  const max = Math.max(
    ...props.points.map(p => Math.max(p.pageviews, p.uniqueVisitors, p.whatsappClicks, p.quoteSubmissions)),
  )
  return max > 0 ? max : 10
})

const hasData = computed(() => {
  return props.points.some(p => p.pageviews > 0 || p.uniqueVisitors > 0 || p.whatsappClicks > 0 || p.quoteSubmissions > 0)
})

const formatDate = (iso?: string): string => {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length < 3) return iso
  return `${parts[2]}/${parts[1]}`
}
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h3 class="text-sm font-bold text-slate-900 tracking-tight">Tendência de Acessos e Ações</h3>
        <p class="text-xs text-slate-500 mt-0.5">Evolução diária de navegação e conversões no período.</p>
      </div>

      <!-- Legenda -->
      <div class="flex flex-wrap items-center gap-3 text-xs">
        <div class="flex items-center gap-1.5 font-medium text-slate-700">
          <span class="w-2.5 h-2.5 rounded-full bg-[#09357a]" />
          <span>Visitantes</span>
        </div>
        <div class="flex items-center gap-1.5 font-medium text-slate-700">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-400" />
          <span>Visualizações</span>
        </div>
        <div class="flex items-center gap-1.5 font-medium text-slate-700">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>WhatsApp</span>
        </div>
        <div class="flex items-center gap-1.5 font-medium text-slate-700">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Orçamentos</span>
        </div>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="status === 'loading'" class="h-48 w-full bg-slate-100/80 animate-pulse rounded-lg flex items-center justify-center">
      <span class="text-xs font-semibold text-slate-400">Carregando série temporal...</span>
    </div>

    <!-- Estado de Erro ou Indisponível -->
    <div v-else-if="status === 'error' || status === 'unavailable'" class="h-48 w-full rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
      <span class="text-xs font-semibold text-slate-500">Dados de tendência temporariamente indisponíveis.</span>
    </div>

    <!-- Estado Vazio (Zero eventos) -->
    <div v-else-if="!hasData" class="h-48 w-full rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
      <span class="text-xs font-bold text-slate-600">Nenhum evento registrado no período selecionado.</span>
      <span class="text-[11px] text-slate-400 mt-1">Os dados aparecerão conforme novos visitantes acessarem o site de produção.</span>
    </div>

    <!-- Gráfico SVG Responsivo e Contínuo -->
    <div v-else class="space-y-2">
      <div class="h-48 w-full relative">
        <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
          <!-- Linhas de grade horizontais -->
          <line x1="0" y1="0" x2="100" y2="0" stroke="#f1f5f9" stroke-width="0.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" stroke-width="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" stroke-width="0.5" />

          <!-- Linha 1: Pageviews (Indigo) -->
          <polyline
            fill="none"
            stroke="#818cf8"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :points="points.map((p, i) => `${(i / (points.length - 1 || 1)) * 100},${50 - (p.pageviews / maxVal) * 45}`).join(' ')"
          />

          <!-- Linha 2: Unique Visitors (Azul Escuro) -->
          <polyline
            fill="none"
            stroke="#09357a"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :points="points.map((p, i) => `${(i / (points.length - 1 || 1)) * 100},${50 - (p.uniqueVisitors / maxVal) * 45}`).join(' ')"
          />

          <!-- Linha 3: WhatsApp (Emerald) -->
          <polyline
            fill="none"
            stroke="#10b981"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :points="points.map((p, i) => `${(i / (points.length - 1 || 1)) * 100},${50 - (p.whatsappClicks / maxVal) * 45}`).join(' ')"
          />

          <!-- Linha 4: Quotes (Amber) -->
          <polyline
            fill="none"
            stroke="#f59e0b"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :points="points.map((p, i) => `${(i / (points.length - 1 || 1)) * 100},${50 - (p.quoteSubmissions / maxVal) * 45}`).join(' ')"
          />
        </svg>
      </div>

      <!-- Eixo X com Datas -->
      <div class="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1">
        <span>{{ formatDate(points[0]?.date) }}</span>
        <span v-if="points.length > 2">{{ formatDate(points[Math.floor(points.length / 2)]?.date) }}</span>
        <span>{{ formatDate(points[points.length - 1]?.date) }}</span>
      </div>
    </div>
  </div>
</template>
