import { ref } from 'vue'
import type {
  AdminHeroSlideItem,
  AvailableHeroMedia,
  PaginatedAvailableMediaResponse,
} from '~/../shared/types/heroSlides'

export function useAdminHeroSlides() {
  const slides = ref<AdminHeroSlideItem[]>([])
  const loading = ref(false)
  const actionLoading = ref(false)
  const availableMedia = ref<AvailableHeroMedia[]>([])
  const mediaLoading = ref(false)
  const pagination = ref({ page: 1, limit: 12, total: 0, total_pages: 1 })
  const error = ref<string | null>(null)

  const fetchHeroSlides = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<AdminHeroSlideItem[]>('/api/admin/hero/slides')
      slides.value = data || []
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao carregar slides.'
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableMedia = async (params?: { serviceId?: string; search?: string; page?: number }) => {
    mediaLoading.value = true
    try {
      const res = await $fetch<PaginatedAvailableMediaResponse>('/api/admin/hero/available-media', {
        params: {
          service_id: params?.serviceId || undefined,
          search: params?.search || undefined,
          page: params?.page || 1,
        },
      })
      availableMedia.value = res.items || []
      pagination.value = res.pagination
    } catch (err: any) {
      console.error('[useAdminHeroSlides] Erro ao buscar mídias:', err)
      availableMedia.value = []
    } finally {
      mediaLoading.value = false
    }
  }

  const addSlide = async (mediaId: string, titleOverride?: string) => {
    actionLoading.value = true
    try {
      await $fetch('/api/admin/hero/slides', {
        method: 'POST',
        body: { media_id: mediaId, title_override: titleOverride },
      })
      await fetchHeroSlides()
    } finally {
      actionLoading.value = false
    }
  }

  const updateSlide = async (id: string, input: { is_active?: boolean; title_override?: string | null }) => {
    actionLoading.value = true
    try {
      await $fetch(`/api/admin/hero/slides/${id}`, {
        method: 'PATCH',
        body: input,
      })
      await fetchHeroSlides()
    } finally {
      actionLoading.value = false
    }
  }

  const deleteSlide = async (id: string) => {
    actionLoading.value = true
    try {
      await $fetch(`/api/admin/hero/slides/${id}`, {
        method: 'DELETE',
      })
      await fetchHeroSlides()
    } finally {
      actionLoading.value = false
    }
  }

  const moveSlide = async (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= slides.value.length || toIndex >= slides.value.length) return
    const reordered = [...slides.value]
    const [moved] = reordered.splice(fromIndex, 1)
    if (!moved) return
    reordered.splice(toIndex, 0, moved)
    slides.value = reordered

    actionLoading.value = true
    try {
      await $fetch('/api/admin/hero/slides/reorder', {
        method: 'POST',
        body: { slide_ids: reordered.map((s) => s.id) },
      })
      await fetchHeroSlides()
    } catch (err) {
      await fetchHeroSlides()
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  return {
    slides,
    loading,
    actionLoading,
    availableMedia,
    mediaLoading,
    pagination,
    error,
    fetchHeroSlides,
    fetchAvailableMedia,
    addSlide,
    updateSlide,
    deleteSlide,
    moveSlide,
  }
}
