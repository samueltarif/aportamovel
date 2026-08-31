<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, MessageSquare, ArrowRight, ShieldCheck } from '@lucide/vue'
import { useAnalytics } from '~/composables/useAnalytics'

interface ShowcaseSlide {
  id: string
  title: string
  subtitle: string
  image: string
  alt: string
  badge: string
  serviceSlug: string
}

const { trackWhatsAppClick } = useAnalytics()

const slides: ShowcaseSlide[] = [
  {
    id: 'manutencao-portoes',
    title: 'Manutenção de Portões de Garagem e Pedestres',
    subtitle: 'Manutenção preventiva e corretiva em portões de todos os modelos, garantindo alinhamento perfeito, redução de ruídos e funcionamento suave com máxima durabilidade.',
    image: '/images/services/manutencao-portoes.webp',
    alt: 'Manutenção de portões de garagem e pedestres',
    badge: 'Portões Automáticos & Manuais',
    serviceSlug: 'manutencao-portoes',
  },
  {
    id: 'recuperacao-gradis',
    title: 'Recuperação, Fabricação e Repintura de Gradis',
    subtitle: 'Beleza, proteção e valorização do patrimônio do condomínio com tratamento antiferrugem especializado, soldas reforçadas e pintura industrial de alta resistência ao tempo.',
    image: '/images/services/recuperacao-gradis.webp',
    alt: 'Recuperação e repintura de gradis',
    badge: 'Tratamento & Pintura Especializada',
    serviceSlug: 'recuperacao-gradis',
  },
  {
    id: 'kit-corrente-portao',
    title: 'Troca de Cabo de Aço por Kit de Corrente',
    subtitle: 'Mais segurança, menos ruídos e quebras no acionamento. Substituição moderna do cabo de aço tradicional por sistema de corrente de alta carga, eliminando rompimentos repentinos.',
    image: '/images/services/kit-corrente-portao.webp',
    alt: 'Kit de corrente para portão de condomínio',
    badge: 'Segurança Reforçada',
    serviceSlug: 'troca-cabo-aco-kit-corrente',
  },
  {
    id: 'troca-trilhos',
    title: 'Troca de Trilhos Inferior e Superior',
    subtitle: 'Deslizamento suave e prevenção de desalinhamentos. Substituição de perfis desgastados por trilhos de aço maciço galvanizado de alta precisão para portões deslizantes.',
    image: '/images/services/troca-trilhos.webp',
    alt: 'Troca de trilhos para portão',
    badge: 'Deslizamento Suave',
    serviceSlug: 'troca-trilhos-inferior-superior',
  },
  {
    id: 'serralheria-geral',
    title: 'Serralheria em Geral',
    subtitle: 'Reformas, ajustes estruturais e fabricações sob medida de estruturas metálicas, corrimãos, guarda-corpos e fechamentos para áreas comuns de condomínios residenciais e comerciais.',
    image: '/images/services/serralheria-geral.webp',
    alt: 'Serviço de serralheria em geral',
    badge: 'Estruturas Sob Medida',
    serviceSlug: 'serralheria-geral',
  },
  {
    id: 'portas-corta-fogo',
    title: 'Portas Corta-Fogo & Estruturas Metálicas',
    subtitle: 'Adequação de portas corta-fogo às normas técnicas de segurança (ABNT), incluindo troca de molas, barras antipânico, ajustes de vedação e laudo para vistoria do Corpo de Bombeiros (AVCB).',
    image: '/images/services/portas-corta-fogo.webp',
    alt: 'Portas corta-fogo para condomínios',
    badge: 'Conformidade ABNT / AVCB',
    serviceSlug: 'portas-corta-fogo',
  },
  {
    id: 'roldanas-duplas-truck',
    title: 'Troca de Roldanas Simples por Roldanas Duplas (Truck)',
    subtitle: 'Maior estabilidade, distribuição uniforme de peso e durabilidade prolongada para portões pesados com fluxo intenso de veículos.',
    image: '/images/services/roldanas-duplas-truck.webp',
    alt: 'Troca de roldanas simples por roldanas duplas truck',
    badge: 'Fluxo Intenso',
    serviceSlug: 'troca-roldanas-duplas-truck',
  },
]

const currentIndex = ref(0)
const isHovered = ref(false)
const isPausedByTab = ref(false)
const prefersReducedMotion = ref(false)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// Mobile Swipe
let touchStartX = 0
let touchStartY = 0

const currentSlide = computed<ShowcaseSlide>(() => slides[currentIndex.value] ?? slides[0]!)

function startAutoplay() {
  stopAutoplay()
  if (prefersReducedMotion.value) return
  autoplayTimer = setInterval(() => {
    if (!isHovered.value && !isPausedByTab.value) {
      nextSlide()
    }
  }, 6500)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.length
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
}

function goToSlide(index: number) {
  currentIndex.value = index
  startAutoplay()
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

function handleQuoteClick(slide: ShowcaseSlide) {
  trackWhatsAppClick({
    cta_location: 'service_card',
    channel_type: 'commercial',
    service_slug: slide.serviceSlug,
  })
  const text = encodeURIComponent(`Olá! Gostaria de mais informações e um orçamento para o serviço: ${slide.title}.`)
  window.open(`https://wa.me/5511912984416?text=${text}`, '_blank')
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
    class="relative bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden group select-none"
    tabindex="0"
    role="region"
    aria-label="Carrossel Informativo de Soluções e Serviços"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @keydown="handleKeyDown"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[440px] items-stretch">
      <!-- Coluna Visual / Imagem (Lado Esquerdo no Desktop) -->
      <div class="lg:col-span-6 relative bg-slate-950 overflow-hidden min-h-[260px] sm:min-h-[340px] lg:min-h-full">
        <transition-group name="fade">
          <div
            v-for="(slide, index) in slides"
            v-show="currentIndex === index"
            :key="slide.id"
            class="absolute inset-0"
          >
            <img
              :src="slide.image"
              :alt="slide.alt"
              loading="lazy"
              decoding="async"
              class="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 lg:hidden" />
          </div>
        </transition-group>

        <!-- Badge no topo da imagem -->
        <div class="absolute top-4 left-4 z-20">
          <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#b91c1c] text-white text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-xs">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>{{ currentSlide.badge }}</span>
          </span>
        </div>

        <!-- Indicador Mobile no canto inferior da imagem -->
        <div class="absolute bottom-3 right-3 z-20 lg:hidden bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20 text-white font-mono text-xs font-bold">
          {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
        </div>
      </div>

      <!-- Coluna Informativa / Conteúdo (Lado Direito no Desktop) -->
      <div class="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-slate-50/50">
        <div class="space-y-4">
          <!-- Título do Serviço -->
          <div class="space-y-2">
            <span class="text-[11px] font-black uppercase tracking-widest text-[#b91c1c]">
              Solução Técnica #{{ currentIndex + 1 }}
            </span>
            <h3 class="text-xl sm:text-2xl font-black text-[#09357a] uppercase tracking-tight leading-tight">
              {{ currentSlide.title }}
            </h3>
          </div>

          <!-- Descrição Técnica Informativa -->
          <p class="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {{ currentSlide.subtitle }}
          </p>

          <!-- Compromisso e Vantagens Rápidas -->
          <div class="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start space-x-3 text-xs text-[#09357a] font-medium">
            <div class="w-2 h-2 rounded-full bg-[#09357a] mt-1.5 shrink-0" />
            <span>Atendimento executado por técnicos CLT próprios com garantia de durabilidade e emissão de ART quando aplicável.</span>
          </div>
        </div>

        <!-- Ações e Controles -->
        <div class="pt-4 border-t border-slate-200/80 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <!-- Botão WhatsApp CTA -->
            <button
              type="button"
              class="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer"
              @click="handleQuoteClick(currentSlide)"
            >
              <MessageSquare class="w-4 h-4 text-emerald-400" />
              <span>Orçamento Deste Serviço</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>

            <!-- Contador Numérico Desktop -->
            <div class="hidden lg:flex items-center space-x-2 font-mono text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span class="text-[#09357a]">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
              <span>/</span>
              <span>{{ String(slides.length).padStart(2, '0') }}</span>
            </div>
          </div>

          <!-- Barra de Navegação (Dots + Setas) -->
          <div class="flex items-center justify-between pt-1">
            <!-- Interactive Dots -->
            <div class="flex items-center space-x-2">
              <button
                v-for="(_, idx) in slides"
                :key="idx"
                type="button"
                class="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                :class="currentIndex === idx ? 'bg-[#09357a] w-7' : 'bg-slate-300 hover:bg-slate-400 w-2.5'"
                :aria-label="`Ir para slide ${idx + 1}`"
                @click="goToSlide(idx)"
              />
            </div>

            <!-- Setas Anterior / Próximo -->
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
                aria-label="Solução anterior"
                @click="handleManualPrev"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button
                type="button"
                class="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
                aria-label="Próxima solução"
                @click="handleManualNext"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
