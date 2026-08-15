<script setup lang="ts">
import type { AnalyticsPeriod } from '~~/shared/types/adminAnalytics'

const props = defineProps<{
  modelValue: AnalyticsPeriod
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AnalyticsPeriod): void
}>()

const periods: { label: string, value: AnalyticsPeriod }[] = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
]

const selectPeriod = (val: AnalyticsPeriod) => {
  if (props.disabled || props.modelValue === val) return
  emit('update:modelValue', val)
}
</script>

<template>
  <div
    class="inline-flex p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-2xs"
    role="tablist"
    aria-label="Selecionar período de análise"
  >
    <button
      v-for="p in periods"
      :key="p.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === p.value"
      :disabled="disabled"
      class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[32px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        modelValue === p.value
          ? 'bg-white text-[#09357a] shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
      ]"
      @click="selectPeriod(p.value)"
    >
      {{ p.label }}
    </button>
  </div>
</template>
