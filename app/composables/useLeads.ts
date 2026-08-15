import { ref } from 'vue'
import type { Lead, LeadDetail, LeadStatus, PaginatedLeadsResponse, RecentLeadItem } from '~~/shared/types/leads'

export function useLeads() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const leadsData = ref<PaginatedLeadsResponse | null>(null)
  const selectedLead = ref<LeadDetail | null>(null)
  const recentLeads = ref<RecentLeadItem[]>([])

  const fetchLeads = async (filters: {
    page?: number
    limit?: number
    status?: string
    form_id?: string
    period?: string
    archived?: boolean
  }) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<PaginatedLeadsResponse>('/api/admin/leads', {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          status: filters.status || 'all',
          form_id: filters.form_id || 'all',
          period: filters.period || 'all',
          archived: filters.archived ? 'true' : 'false',
        },
      })
      leadsData.value = res
    }
    catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar lista de leads.'
    }
    finally {
      loading.value = false
    }
  }

  const searchLeads = async (searchQuery: string, status = 'all', page = 1, archived = false) => {
    if (!searchQuery.trim()) {
      return fetchLeads({ page, status, archived })
    }
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<PaginatedLeadsResponse>('/api/admin/leads/search', {
        method: 'POST',
        body: {
          query: searchQuery.trim(),
          status,
          page,
          limit: 20,
          archived,
        },
      })
      leadsData.value = res
    }
    catch (err: any) {
      error.value = err.data?.message || 'Erro na busca de leads.'
    }
    finally {
      loading.value = false
    }
  }

  const fetchRecentLeads = async () => {
    loading.value = true
    error.value = null
    try {
      recentLeads.value = await $fetch<RecentLeadItem[]>('/api/admin/leads/recent')
    }
    catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar leads recentes.'
    }
    finally {
      loading.value = false
    }
  }

  const fetchLeadDetail = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      selectedLead.value = await $fetch<LeadDetail>(`/api/admin/leads/${id}`)
    }
    catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar detalhes do lead.'
    }
    finally {
      loading.value = false
    }
  }

  const updateStatus = async (id: string, newStatus: LeadStatus) => {
    const res = await $fetch<{ success: boolean }>(`/api/admin/leads/${id}/status`, {
      method: 'PATCH',
      body: { status: newStatus },
    })
    if (selectedLead.value && selectedLead.value.id === id) {
      await fetchLeadDetail(id)
    }
    return res
  }

  const addNote = async (id: string, note: string) => {
    const res = await $fetch(`/api/admin/leads/${id}/notes`, {
      method: 'POST',
      body: { note },
    })
    if (selectedLead.value && selectedLead.value.id === id) {
      await fetchLeadDetail(id)
    }
    return res
  }

  const toggleArchive = async (id: string, archived: boolean) => {
    const res = await $fetch(`/api/admin/leads/${id}/archive`, {
      method: 'PATCH',
      body: { archived },
    })
    if (selectedLead.value && selectedLead.value.id === id) {
      await fetchLeadDetail(id)
    }
    return res
  }

  return {
    loading,
    error,
    leadsData,
    selectedLead,
    recentLeads,
    fetchLeads,
    searchLeads,
    fetchRecentLeads,
    fetchLeadDetail,
    updateStatus,
    addNote,
    toggleArchive,
  }
}
