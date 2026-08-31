<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { PublicHeroSlide } from '~/../shared/types/heroSlides'

const props = defineProps<{
  slides: PublicHeroSlide[]
  loading?: boolean
}>()

const currentIndex = ref(0)
const isHovered = ref(false)
const isPausedByTab = ref(false)
const containerRef = ref<HTMLElement | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// Detecção de prefers-reduced-motion
const prefersReducedMotion = ref(false)

// Suporte a Touch Swipe
let touchStartX = 0
let touchStartY = 0

const totalSlides = computed(() => props.slides.length)
const currentSlide = computed(() => props.slides[currentIndex.value] || null)

// Estratégia de Janela Ativa para Performance (Apenas atual, anterior e próximo baixam imagens)
function shouldRenderSlideImage(index: number): boolean {
  if (totalSlides.value <= 3) return true
  const cur = currentIndex.value
  const total = totalSlides.value
  const prev = (cur - 1 + total) % total
  const next = (cur + 1) % total
  return index === cur || index === next || index === prev
}

function startAutoplay() {
  stopAutoplay()
  if (totalSlides.value <= 1 || prefersReducedMotion.value) return

  autoplayTimer = setInterval(() => {
    if (!isHovered.value && !isPausedByTab.value) {
      nextSlide()
    }
  }, 5000)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function nextSlide() {
  if (totalSlides.value <= 1) return
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value
}

function prevSlide() {
  if (totalSlides.value <= 1) return
  currentIndex.value = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value
}

function handleManualNext() {
  nextSlide()
  startAutoplay()
}

function handleManualPrev() {
  prevSlide()
  startAutoplay()
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    handleManualPrev()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    handleManualNext()
  }
}

function handleTouchStart(event: TouchEvent) {
  if (event.touches[0]) {
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!event.changedTouches[0]) return
  const deltaX = event.changedTouches[0].clientX - touchStartX
  const deltaY = event.changedTouches[0].clientY - touchStartY

  // Apenas aciona se o movimento horizontal for maior que o vertical (evita atrapalhar scroll vertical)
  if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) {
      handleManualNext()
    } else {
      handleManualPrev()
    }
  }
}

function handleVisibilityChange() {
  isPausedByTab.value = document.visibilityState !== 'visible'
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    prefersReducedMotion.value = true
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-950 group select-none"
    tabindex="0"
    role="region"
    aria-roledescription="carrossel"
    aria-label="Carrossel de Fotos dos Serviços da A Portamóvel"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @keydown="handleKeyDown"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <!-- Container dos Slides -->
    <div class="relative w-full h-64 sm:h-80 lg:h-[440px]">
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="absolute inset-0 transition-opacity duration-500 ease-in-out bg-slate-950"
        :class="currentIndex === index ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'"
        :aria-hidden="currentIndex !== index"
      >
        <img
          v-if="shouldRenderSlideImage(index)"
          :src="slide.imageUrl"
          :alt="slide.altText || slide.title"
          class="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-103"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          decoding="async"
        />

        <!-- Gradiente Inferior Escuro para Legibilidade -->
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 text-white flex items-end justify-between gap-4">
          <div class="min-w-0 pr-2">
            <h3 class="font-extrabold text-base sm:text-lg lg:text-xl text-white uppercase tracking-tight leading-tight drop-shadow-md">
              {{ slide.title }}
            </h3>
          </div>

          <!-- Indicador Numérico Limpo (ex: 03 / 12) -->
          <div v-if="totalSlides > 1" class="shrink-0 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15">
            <span class="text-xs sm:text-sm font-bold text-white tracking-widest font-mono">
              {{ String(index + 1).padStart(2, '0') }} / {{ String(totalSlides).padStart(2, '0') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles de Navegação (Apenas se houver mais de 1 slide) -->
    <template v-if="totalSlides > 1">
      <button
        type="button"
        class="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white transition-all backdrop-blur-xs flex items-center justify-center opacity-80 hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
        aria-label="Imagem anterior"
        @click.stop="handleManualPrev"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        type="button"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white transition-all backdrop-blur-xs flex items-center justify-center opacity-80 hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
        aria-label="Próxima imagem"
        @click.stop="handleManualNext"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </template>
  </div>
</template>
