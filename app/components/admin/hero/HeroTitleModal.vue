<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Check, RotateCcw } from '@lucide/vue'
import type { AdminHeroSlideItem } from '~/../shared/types/heroSlides'

const props = defineProps<{
  show: boolean
  slide: AdminHeroSlideItem | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', titleOverride: string | null): void
}>()

const customTitle = ref('')

watch(
  () => props.slide,
  (val) => {
    customTitle.value = val?.title_override || ''
  },
  { immediate: true }
)

function handleSave() {
  const trimmed = customTitle.value.trim()
  emit('save', trimmed.length >= 2 ? trimmed : null)
}

function handleReset() {
  customTitle.value = ''
  emit('save', null)
}
</script>

<template>
  <div v-if="show && slide" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-slate-800 text-sm">Personalizar Título do Slide</h3>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          @click="$emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1">Título Automático (do Serviço)</label>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold">
            {{ slide.service_name || 'Sem serviço vinculado' }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Este é o nome padrão obtido automaticamente do catálogo de serviços.</p>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Título Personalizado (Opcional)</label>
          <input
            v-model="customTitle"
            type="text"
            maxlength="100"
            placeholder="Ex: MANUTENÇÃO PREVENTIVA DE PORTÕES"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#09357a] outline-none"
          />
          <div class="flex justify-between items-center mt-1 text-[11px] text-slate-400">
            <span>Deixe em branco para usar o título automático.</span>
            <span>{{ customTitle.length }}/100</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
        <button
          type="button"
          :disabled="loading"
          class="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          @click="handleReset"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restaurar Automático</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="loading"
            class="px-4 py-2 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            @click="handleSave"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
