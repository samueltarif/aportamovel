import { ref } from 'vue'
import type { PaginatedPublicationsResponse, PublicPublicationCard } from '~/../shared/types/publications'

export function usePublicPublications() {
  const publications = ref<PublicPublicationCard[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const total = ref(0)
  const hasNext = ref(false)
  const currentServiceSlug = ref<string>('all')

  const fetchPublications = async (serviceSlug = 'all', reset = true) => {
    if (reset) {
      page.value = 1
      publications.value = []
      loading.value = true
    } else {
      loadingMore.value = true
    }
    error.value = null
    currentServiceSlug.value = serviceSlug

    try {
      const data = await $fetch<PaginatedPublicationsResponse>('/api/public/publications', {
        params: {
          service_slug: serviceSlug !== 'all' ? serviceSlug : undefined,
          page: page.value,
          limit: 6,
        },
      })

      if (reset) {
        publications.value = data.items
      } else {
        publications.value = [...publications.value, ...data.items]
      }

      total.value = data.pagination.total
      hasNext.value = data.pagination.has_next
    } catch (err: any) {
      console.error('[usePublicPublications] Erro ao carregar trabalhos:', err)
      error.value = 'Falha ao carregar trabalhos realizados.'
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadMore = async () => {
    if (!hasNext.value || loadingMore.value) return
    page.value++
    await fetchPublications(currentServiceSlug.value, false)
  }

  return {
    publications,
    loading,
    loadingMore,
    error,
    page,
    total,
    hasNext,
    currentServiceSlug,
    fetchPublications,
    loadMore,
  }
}
