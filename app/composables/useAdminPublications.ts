import { ref } from 'vue'
import type { ServicePublication, AdminPublicationDetail } from '~/../shared/types/publications'

export function useAdminPublications() {
  const publications = ref<ServicePublication[]>([])
  const currentPublication = ref<AdminPublicationDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPublications = async (filters?: { serviceId?: string; status?: string }) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ServicePublication[]>('/api/admin/publications', {
        params: {
          service_id: filters?.serviceId,
          status: filters?.status,
        },
      })
      publications.value = data || []
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao carregar publicações.'
    } finally {
      loading.value = false
    }
  }

  const fetchPublicationById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<AdminPublicationDetail>(`/api/admin/publications/${id}`)
      currentPublication.value = data
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao carregar detalhes da publicação.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPublication = async (input: {
    service_id: string
    title: string
    slug: string
    summary: string
    description: string
    display_order?: number
  }) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ServicePublication>('/api/admin/publications', {
        method: 'POST',
        body: input,
      })
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao criar publicação.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePublication = async (
    id: string,
    input: {
      service_id?: string
      title?: string
      slug?: string
      summary?: string
      description?: string
      display_order?: number
    }
  ) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ServicePublication>(`/api/admin/publications/${id}`, {
        method: 'PATCH',
        body: input,
      })
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao atualizar publicação.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const publishPublication = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ServicePublication>(`/api/admin/publications/${id}/publish`, {
        method: 'PATCH',
      })
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao publicar trabalho.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const archivePublication = async (id: string, archived: boolean) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ServicePublication>(`/api/admin/publications/${id}/archive`, {
        method: 'PATCH',
        body: { archived },
      })
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao arquivar publicação.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const unpublishPublication = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ServicePublication>(`/api/admin/publications/${id}/unpublish`, {
        method: 'PATCH',
      })
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao ocultar publicação.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePublication = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ success: boolean }>(`/api/admin/publications/${id}`, {
        method: 'DELETE',
      })
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao excluir publicação.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    publications,
    currentPublication,
    loading,
    error,
    fetchPublications,
    fetchPublicationById,
    createPublication,
    updatePublication,
    publishPublication,
    unpublishPublication,
    archivePublication,
    deletePublication,
  }
}
