<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnalyticsTrendPoint, SectionStatus } from '~~/shared/types/adminAnalytics'

const props = defineProps<{
  points: AnalyticsTrendPoint[]
  status: SectionStatus
}>()

type SeriesKey = 'uniqueVisitors' | 'pageviews' | 'whatsappClicks' | 'quoteSubmissions'

const series: { key: SeriesKey; label: string; color: string; area?: boolean }[] = [
  { key: 'pageviews', label: 'Visualizações', color: '#818cf8' },
  { key: 'uniqueVisitors', label: 'Visitantes', color: '#2563eb', area: true },
  { key: 'whatsappClicks', label: 'WhatsApp', color: '#10b981' },
  { key: 'quoteSubmissions', label: 'Orçamentos', color: '#f59e0b' },
]

const hidden = ref<Set<SeriesKey>>(new Set())
const toggle = (k: SeriesKey) => {
  const next = new Set(hidden.value)
  next.has(k) ? next.delete(k) : next.add(k)
  hidden.value = next
}

const W = 600
const H = 200
const PAD = 8

const visible = computed(() => series.filter(s => !hidden.value.has(s.key)))

const maxVal = computed(() => {
  const m = Math.max(1, ...props.points.flatMap(p => visible.value.map(s => p[s.key] ?? 0)))
  return Math.ceil(m * 1.1)
})

const hasData = computed(() =>
  props.points.some(p => p.pageviews > 0 || p.uniqueVisitors > 0 || p.whatsappClicks > 0 || p.quoteSubmissions > 0),
)

const xOf = (i: number) => (i / Math.max(props.points.length - 1, 1)) * W
const yOf = (v: number) => H - PAD - (v / maxVal.value) * (H - PAD * 2)

const smooth = (key: SeriesKey) => {
  const pts = props.points.map((p, i) => [xOf(i), yOf(p[key] ?? 0)] as const)
  if (pts.length < 2) return ''
  let d = `M${pts[0]![0]},${pts[0]![1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!
    const [x1, y1] = pts[i]!
    const cx = (x0 + x1) / 2
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

const areaOf = (key: SeriesKey) => `${smooth(key)} L${W},${H} L0,${H} Z`

const gridLines = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => ({ y: PAD + f * (H - PAD * 2), label: Math.round(maxVal.value * (1 - f)) })))

const hover = ref<number | null>(null)
const onMove = (e: PointerEvent) => {
  const el = e.currentTarget as SVGElement
  const r = el.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  hover.value = Math.round(ratio * (props.points.length - 1))
}

const formatDate = (iso?: string): string => {
  if (!iso) return ''
  const parts = iso.split('-')
  return parts.length < 3 ? iso : `${parts[2]}/${parts[1]}`
}

const tickIdx = computed(() => {
  const n = props.points.length
  if (n < 2) return [0]
  const step = Math.max(1, Math.floor((n - 1) / 4))
  const arr: number[] = []
  for (let i = 0; i < n; i += step) arr.push(i)
  if (arr[arr.length - 1] !== n - 1) arr.push(n - 1)
  return arr
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-sm font-semibold tracking-tight text-slate-900">Tendência de acessos e ações</h3>
        <p class="mt-0.5 text-xs text-slate-500">Evolução diária no período. Clique na legenda para ocultar uma série.</p>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="s in series"
          :key="s.key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
          :class="hidden.has(s.key) ? 'border-slate-200 bg-transparent text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'"
          @click="toggle(s.key)"
        >
          <span class="h-1.5 w-1.5 rounded-full" :style="{ background: hidden.has(s.key) ? '#cbd5e1' : s.color }" />
          {{ s.label }}
        </button>
      </div>
    </div>

    <div v-if="status === 'loading'" class="flex h-52 w-full animate-pulse items-center justify-center rounded-xl bg-slate-100/80">
      <span class="text-xs font-medium text-slate-400">Carregando série temporal...</span>
    </div>

    <div v-else-if="status === 'error' || status === 'unavailable'" class="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-500">
      Dados de tendência temporariamente indisponíveis.
    </div>

    <div v-else-if="!hasData" class="flex h-52 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
      <span class="text-xs font-semibold text-slate-600">Nenhum evento registrado no período.</span>
      <span class="mt-1 text-[11px] text-slate-400">Os dados aparecem conforme visitantes acessam o site.</span>
    </div>

    <div v-else class="relative">
      <div class="flex">
        <div class="flex h-52 w-8 flex-col justify-between py-1 pr-2 text-right text-[10px] tabular-nums text-slate-400">
          <span v-for="g in gridLines" :key="g.y">{{ g.label }}</span>
        </div>
        <div class="relative h-52 flex-1">
          <svg
            class="h-full w-full touch-none overflow-visible"
            :viewBox="`0 0 ${W} ${H}`"
            preserveAspectRatio="none"
            @pointermove="onMove"
            @pointerleave="hover = null"
          >
            <defs>
              <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2563eb" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line v-for="g in gridLines" :key="g.y" x1="0" :y1="g.y" :x2="W" :y2="g.y" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 5" vector-effect="non-scaling-stroke" />

            <template v-for="s in visible" :key="s.key">
              <path v-if="s.area" :d="areaOf(s.key)" fill="url(#trend-area)" />
              <path :d="smooth(s.key)" fill="none" :stroke="s.color" :stroke-width="s.area ? 2 : 1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            </template>

            <line v-if="hover !== null" :x1="xOf(hover)" y1="0" :x2="xOf(hover)" :y2="H" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" />
          </svg>

          <div
            v-if="hover !== null && points[hover]"
            class="pointer-events-none absolute top-1 z-10 min-w-[140px] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[11px] shadow-lg backdrop-blur"
            :style="{ left: `${(hover / Math.max(points.length - 1, 1)) * 100}%`, transform: hover > points.length / 2 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)' }"
          >
            <div class="mb-1 font-semibold text-slate-800">{{ formatDate(points[hover]!.date) }}</div>
            <div v-for="s in visible" :key="s.key" class="flex items-center justify-between gap-4 text-slate-600">
              <span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full" :style="{ background: s.color }" />{{ s.label }}</span>
              <span class="font-semibold tabular-nums text-slate-900">{{ points[hover]![s.key] ?? 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ml-8 mt-1.5 flex justify-between text-[10px] font-medium text-slate-400">
        <span v-for="i in tickIdx" :key="i">{{ formatDate(points[i]?.date) }}</span>
      </div>
    </div>
  </div>
</template>
