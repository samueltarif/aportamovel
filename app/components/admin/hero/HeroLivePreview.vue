<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Eye } from '@lucide/vue'
import type { AdminHeroSlideItem } from '~/../shared/types/heroSlides'

const props = defineProps<{
  slides: AdminHeroSlideItem[]
}>()

const activeSlides = computed(() => props.slides.filter((s) => s.is_active))
const currentIdx = ref(0)

watch(
  () => activeSlides.value.length,
  (len) => {
    if (currentIdx.value >= len) currentIdx.value = Math.max(0, len - 1)
  }
)

const currentSlide = computed(() => activeSlides.value[currentIdx.value] || null)

function next() {
  if (activeSlides.value.length === 0) return
  currentIdx.value = (currentIdx.value + 1) % activeSlides.value.length
}

function prev() {
  if (activeSlides.value.length === 0) return
  currentIdx.value = (currentIdx.value - 1 + activeSlides.value.length) % activeSlides.value.length
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Eye class="w-4 h-4 text-[#09357a]" />
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-700">Prévia do Carrossel Ativo</h3>
      </div>
      <span v-if="activeSlides.length > 0" class="text-[11px] font-semibold text-slate-500">
        {{ currentIdx + 1 }} de {{ activeSlides.length }} slide(s) ativo(s)
      </span>
    </div>

    <!-- Container da Prévia -->
    <div class="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
      <div v-if="!currentSlide" class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center space-y-2">
        <p class="text-xs font-semibold text-slate-300">Nenhum slide ativo no momento.</p>
        <p class="text-[11px] text-slate-500">O site exibirá o slide de fallback padrão com fotos de manutenção de portões.</p>
      </div>

      <template v-else>
        <img
          :src="currentSlide.image_url"
          :alt="currentSlide.alt_text || currentSlide.effective_title"
          class="w-full h-full object-cover object-center transition-opacity duration-300"
        />

        <!-- Gradiente Inferior com Título da Categoria -->
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white flex items-end justify-between gap-3">
          <div class="min-w-0">
            <h4 class="font-black text-sm sm:text-base uppercase tracking-tight leading-tight truncate">
              {{ currentSlide.effective_title }}
            </h4>
            <span class="text-[10px] text-slate-300 font-medium truncate block mt-0.5">
              Publicação: {{ currentSlide.publication_title }}
            </span>
          </div>

          <span class="text-xs font-bold text-slate-300 shrink-0 font-mono">
            {{ String(currentIdx + 1).padStart(2, '0') }} / {{ String(activeSlides.length).padStart(2, '0') }}
          </span>
        </div>

        <!-- Controles de Navegação da Prévia -->
        <button
          v-if="activeSlides.length > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
          @click="prev"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <button
          v-if="activeSlides.length > 1"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
          @click="next"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </template>
    </div>
  </div>
</template>
