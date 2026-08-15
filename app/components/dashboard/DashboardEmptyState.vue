<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon: Component
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between h-full">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <component :is="icon" class="h-4 w-4" aria-hidden="true" />
      </div>
      <h3 class="text-sm font-bold text-slate-800">{{ title }}</h3>
    </div>

    <!-- Empty state visual honesto -->
    <div class="flex-1 flex flex-col items-center justify-center py-8 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 p-4">
      <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <component :is="icon" class="h-5 w-5" aria-hidden="true" />
      </div>
      <p class="text-xs font-medium text-slate-500 max-w-xs">
        {{ description }}
      </p>
      <span class="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60">
        <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Dados ainda não disponíveis
      </span>
    </div>
  </div>
</template>
