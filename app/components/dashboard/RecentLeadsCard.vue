<script setup lang="ts">
import { onMounted } from 'vue'
import { useLeads } from '~/composables/useLeads'
import LeadStatusBadge from '~/components/leads/LeadStatusBadge.vue'

const { recentLeads, loading, error, fetchRecentLeads } = useLeads()

onMounted(() => {
  fetchRecentLeads()
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-bold text-gray-900">Leads Recentes</h3>
        <p class="text-xs text-gray-500">Últimas solicitações recebidas via formulário</p>
      </div>
      <NuxtLink
        to="/gestao/leads"
        class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
      >
        Ver todos →
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading && recentLeads.length === 0" class="py-6 text-center text-xs text-gray-400">
      Carregando solicitações recentes...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
      Não foi possível carregar os leads recentes no momento.
    </div>

    <!-- Empty State -->
    <div v-else-if="recentLeads.length === 0" class="py-6 text-center text-xs text-gray-400">
      Nenhuma solicitação recente registrada.
    </div>

    <!-- Leads List -->
    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="lead in recentLeads"
        :key="lead.id"
        class="py-3 flex items-center justify-between hover:bg-gray-50/80 px-2 rounded-lg transition-colors"
      >
        <div>
          <h4 class="text-sm font-semibold text-gray-900">{{ lead.full_name }}</h4>
          <p class="text-xs text-gray-500">
            {{ lead.company_or_condominium || lead.service_name || (lead.form_id === 'contact_form' ? 'Contato Geral' : 'Orçamento Rápido') }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <LeadStatusBadge :status="lead.status" />
          <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatDate(lead.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
