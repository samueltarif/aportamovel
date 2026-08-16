import { ref } from 'vue'
import type { Service, ServiceCreateInput, ServiceUpdateInput } from '~/../shared/types/services'

export function useAdminServices() {
  const services = ref<Service[]>([])
  const currentService = ref<Service | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchServices = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Service[]>('/api/admin/services')
      services.value = data || []
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao carregar serviços.'
    } finally {
      loading.value = false
    }
  }

  const fetchServiceById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Service>(`/api/admin/services/${id}`)
      currentService.value = data
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao carregar serviço.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createService = async (input: ServiceCreateInput) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Service>('/api/admin/services', {
        method: 'POST',
        body: input,
      })
      await fetchServices()
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao criar serviço.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateService = async (id: string, input: ServiceUpdateInput) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Service>(`/api/admin/services/${id}`, {
        method: 'PATCH',
        body: input,
      })
      await fetchServices()
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao atualizar serviço.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const activateService = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Service>(`/api/admin/services/${id}`, {
        method: 'PATCH',
        body: { is_active: true },
      })
      await fetchServices()
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao ativar serviço.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const archiveService = async (id: string, archived: boolean) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Service>(`/api/admin/services/${id}/archive`, {
        method: 'PATCH',
        body: { archived },
      })
      await fetchServices()
      return data
    } catch (err: any) {
      error.value = err?.statusMessage || 'Erro ao arquivar serviço.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    services,
    currentService,
    loading,
    error,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    activateService,
    archiveService,
  }
}
