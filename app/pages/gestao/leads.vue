<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useLeads } from '~/composables/useLeads'
import { useAdminState } from '~/composables/useAdminState'
import type { LeadStatus } from '~~/shared/types/leads'
import LeadTable from '~/components/leads/LeadTable.vue'
import LeadMobileCard from '~/components/leads/LeadMobileCard.vue'
import LeadDetailSheet from '~/components/leads/LeadDetailSheet.vue'

definePageMeta({
  layout: 'gestao',
  middleware: 'gestao',
})

useHead({
  title: 'Gestão de Leads - A Portamóvel',
})

const { adminData } = useAdminState()
const isAdmin = computed(() => adminData.value?.role === 'admin')

const {
  loading,
  error,
  leadsData,
  selectedLead,
  fetchLeads,
  searchLeads,
  fetchLeadDetail,
  updateStatus,
  addNote,
  toggleArchive,
} = useLeads()

const activeStatus = ref<string>('all')
const searchQuery = ref('')
const currentPage = ref(1)
const isDetailOpen = ref(false)

const loadData = () => {
  if (searchQuery.value.trim()) {
    searchLeads(searchQuery.value, activeStatus.value, currentPage.value, activeStatus.value === 'archived')
  }
  else {
    fetchLeads({
      page: currentPage.value,
      status: activeStatus.value === 'archived' ? 'all' : activeStatus.value,
      archived: activeStatus.value === 'archived',
    })
  }
}

onMounted(() => {
  loadData()
})

watch([activeStatus, currentPage], () => {
  loadData()
})

const handleStatusTab = (statusId: string) => {
  activeStatus.value = statusId
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleSelectLead = async (id: string) => {
  await fetchLeadDetail(id)
  isDetailOpen.value = true
}

const handleUpdateStatus = async (status: LeadStatus) => {
  if (!selectedLead.value) return
  await updateStatus(selectedLead.value.id, status)
  loadData()
}

const handleAddNote = async (note: string) => {
  if (!selectedLead.value) return
  await addNote(selectedLead.value.id, note)
}

const handleToggleArchive = async (archived: boolean) => {
  if (!selectedLead.value) return
  await toggleArchive(selectedLead.value.id, archived)
  isDetailOpen.value = false
  loadData()
}

const statusTabs = computed(() => {
  const c = leadsData.value?.counters
  return [
    { id: 'all', label: 'Todos', count: c?.all || 0 },
    { id: 'new', label: 'Novos', count: c?.new || 0 },
    { id: 'contacted', label: 'Em Contato', count: c?.contacted || 0 },
    { id: 'qualified', label: 'Qualificados', count: c?.qualified || 0 },
    { id: 'proposal_sent', label: 'Proposta', count: c?.proposal_sent || 0 },
    { id: 'won', label: 'Ganhos', count: c?.won || 0 },
    { id: 'lost', label: 'Perdidos', count: c?.lost || 0 },
    { id: 'spam', label: 'Spam', count: c?.spam || 0 },
    { id: 'archived', label: 'Arquivados', count: c?.archived || 0 },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Leads</h1>
        <p class="text-xs text-gray-500 mt-1">Solicitações comerciais e orçamentos enviados pelo site</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative flex-1 sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome, telefone..."
            class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
            @keydown.enter.prevent="handleSearch"
          >
          <span class="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>
        <button
          class="p-2 bg-white border border-gray-200 rounded-xl text-xs hover:bg-gray-50 shadow-xs transition-colors"
          title="Atualizar lista"
          @click="loadData"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
      <button
        v-for="tab in statusTabs"
        :key="tab.id"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
        :class="activeStatus === tab.id ? 'bg-[#09357a] text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
        @click="handleStatusTab(tab.id)"
      >
        <span>{{ tab.label }}</span>
        <span
          class="px-1.5 py-0.2 rounded-full text-[10px]"
          :class="activeStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex justify-between items-center">
      <span>{{ error }}</span>
      <button class="font-bold underline" @click="loadData">Tentar novamente</button>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block">
      <LeadTable
        :leads="leadsData?.items || []"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="leadsData?.pagination?.totalPages || 1"
        :total="leadsData?.pagination?.total || 0"
        @select-lead="handleSelectLead"
        @change-page="currentPage = $event"
      />
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <div v-if="loading && (!leadsData?.items || leadsData.items.length === 0)" class="py-8 text-center text-xs text-gray-400">
        Carregando leads...
      </div>
      <div v-else-if="!leadsData?.items || leadsData.items.length === 0" class="py-8 text-center text-xs text-gray-400">
        Nenhum lead encontrado com os filtros selecionados.
      </div>
      <LeadMobileCard
        v-for="lead in leadsData?.items || []"
        :key="lead.id"
        :lead="lead"
        @select-lead="handleSelectLead"
      />
    </div>

    <!-- Lead Detail Sheet -->
    <LeadDetailSheet
      :lead="selectedLead"
      :is-open="isDetailOpen"
      :is-admin="isAdmin"
      @close="isDetailOpen = false"
      @update-status="handleUpdateStatus"
      @add-note="handleAddNote"
      @toggle-archive="handleToggleArchive"
    />
  </div>
</template>
