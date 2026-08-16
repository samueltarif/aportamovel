<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.show) emit('cancel') }
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" @click.self="$emit('cancel')">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-bold text-slate-800">{{ title }}</h3>
        <button type="button" class="text-slate-400 hover:text-slate-600 text-xl font-bold" @click="$emit('cancel')">&times;</button>
      </div>
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">{{ message }}</p>

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button type="button" class="inline-flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors" @click="$emit('cancel')">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Voltar / Cancelar</span>
        </button>
        <button type="button" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors" @click="$emit('confirm')">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>
