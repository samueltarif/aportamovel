<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { CalendarRange } from '@lucide/vue'
import type { AnalyticsPeriodSelection, AnalyticsPreset } from '~~/shared/types/adminAnalytics'

const props = defineProps<{
  modelValue: AnalyticsPeriodSelection
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AnalyticsPeriodSelection): void
}>()

const MAX_RANGE_DAYS = 366

const presets: { label: string, value: AnalyticsPreset }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
]

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo, igual ao servidor. */
const todaySP = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

const addDays = (date: string, amount: number) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + amount)
  return d.toISOString().slice(0, 10)
}

const formatBR = (iso?: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y?.slice(2)}`
}

const isCustom = computed(() => props.modelValue.key === 'custom')

const customLabel = computed(() => {
  const { from, to } = props.modelValue
  if (!isCustom.value || !from || !to) return 'Personalizado'
  return from === to ? formatBR(from) : `${formatBR(from)} – ${formatBR(to)}`
})

// ----- Popover do intervalo personalizado
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const draftFrom = ref('')
const draftTo = ref('')
const today = ref(todaySP())

onClickOutside(root, () => {
  open.value = false
})

const togglePopover = () => {
  if (props.disabled) return
  if (!open.value) {
    today.value = todaySP()
    // Preenche com o intervalo atual (ou os últimos 7 dias como sugestão)
    draftFrom.value = props.modelValue.from || addDays(today.value, -6)
    draftTo.value = props.modelValue.to || today.value
  }
  open.value = !open.value
}

const validationError = computed(() => {
  if (!draftFrom.value || !draftTo.value) return 'Informe as duas datas.'
  if (draftFrom.value > draftTo.value) return 'A data inicial deve ser anterior à final.'
  if (draftTo.value > today.value) return 'A data final não pode estar no futuro.'
  const days = Math.round((Date.parse(`${draftTo.value}T00:00:00Z`) - Date.parse(`${draftFrom.value}T00:00:00Z`)) / 86400000) + 1
  if (days > MAX_RANGE_DAYS) return `O intervalo máximo é de ${MAX_RANGE_DAYS} dias.`
  return ''
})

const applyCustom = () => {
  if (validationError.value) return
  emit('update:modelValue', { key: 'custom', from: draftFrom.value, to: draftTo.value })
  open.value = false
}

const selectPreset = (val: AnalyticsPreset) => {
  open.value = false
  if (props.disabled || props.modelValue.key === val) return
  emit('update:modelValue', { key: val })
}
</script>

<template>
  <div ref="root" class="relative">
    <div
      class="flex flex-wrap gap-0.5 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-2xs"
      role="tablist"
      aria-label="Selecionar período de análise"
    >
      <button
        v-for="p in presets"
        :key="p.value"
        type="button"
        role="tab"
        :aria-selected="modelValue.key === p.value"
        :disabled="disabled"
        class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[32px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          modelValue.key === p.value
            ? 'bg-white text-[#09357a] shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
        ]"
        @click="selectPreset(p.value)"
      >
        {{ p.label }}
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="isCustom"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :disabled="disabled"
        class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[32px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          isCustom || open
            ? 'bg-white text-[#09357a] shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
        ]"
        @click="togglePopover"
      >
        <CalendarRange class="w-3.5 h-3.5" aria-hidden="true" />
        <span>{{ customLabel }}</span>
      </button>
    </div>

    <!-- Popover: intervalo personalizado -->
    <div
      v-if="open"
      role="dialog"
      aria-label="Período personalizado"
      class="absolute right-0 top-full mt-2 z-30 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-lg space-y-3"
      @keydown.esc="open = false"
    >
      <p class="text-xs font-bold text-slate-700">Período personalizado</p>

      <div class="grid grid-cols-2 gap-2">
        <label class="space-y-1">
          <span class="block text-[11px] font-semibold text-slate-500">De</span>
          <input
            v-model="draftFrom"
            type="date"
            :max="draftTo || today"
            class="w-full h-9 rounded-md border border-slate-300 px-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
          >
        </label>
        <label class="space-y-1">
          <span class="block text-[11px] font-semibold text-slate-500">Até</span>
          <input
            v-model="draftTo"
            type="date"
            :min="draftFrom"
            :max="today"
            class="w-full h-9 rounded-md border border-slate-300 px-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
          >
        </label>
      </div>

      <p v-if="validationError" class="text-[11px] font-medium text-red-600">
        {{ validationError }}
      </p>

      <div class="flex justify-end gap-2 pt-1">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-100"
          @click="open = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="!!validationError"
          class="px-3 py-1.5 text-xs font-bold text-white bg-[#09357a] rounded-lg hover:bg-[#072a61] disabled:opacity-50 disabled:cursor-not-allowed"
          @click="applyCustom"
        >
          Aplicar
        </button>
      </div>
    </div>
  </div>
</template>
