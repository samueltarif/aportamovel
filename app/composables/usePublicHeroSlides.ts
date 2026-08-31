import { ref, computed } from 'vue'
import type { PublicHeroSlide } from '~/../shared/types/heroSlides'

export const FALLBACK_HERO_SLIDE: PublicHeroSlide = {
  id: 'fallback-static-hero',
  imageUrl: '/images/services/manutencao-portoes.webp',
  altText: 'Manutenção de portões de garagem e pedestres',
  title: 'MANUTENÇÃO DE PORTÕES',
  sortOrder: 0,
}

export function usePublicHeroSlides() {
  const slides = ref<PublicHeroSlide[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchHeroSlides = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<PublicHeroSlide[]>('/api/public/hero-slides')
      slides.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      console.error('[usePublicHeroSlides] Erro ao carregar slides do hero:', err)
      error.value = 'Falha ao buscar carrossel de fotos.'
      slides.value = []
    } finally {
      loading.value = false
    }
  }

  const effectiveSlides = computed<PublicHeroSlide[]>(() => {
    if (slides.value.length > 0) return slides.value
    return [FALLBACK_HERO_SLIDE]
  })

  const isFallback = computed(() => slides.value.length === 0)

  return {
    slides,
    effectiveSlides,
    isFallback,
    loading,
    error,
    fetchHeroSlides,
  }
}
