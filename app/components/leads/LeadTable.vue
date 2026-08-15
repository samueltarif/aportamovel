<script setup lang="ts">
import type { Lead } from '~~/shared/types/leads'
import LeadStatusBadge from './LeadStatusBadge.vue'

defineProps<{
  leads: Lead[]
  loading: boolean
  currentPage: number
  totalPages: number
  total: number
}>()

defineEmits<{
  (e: 'select-lead', id: string): void
  (e: 'change-page', page: number): void
}>()

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="bg-white border rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase bg-gray-50 text-gray-600 border-b">
          <tr>
            <th class="px-4 py-3">Cliente / Condomínio</th>
            <th class="px-4 py-3">Contato</th>
            <th class="px-4 py-3">Origem / Serviço</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading && leads.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-500">
              Carregando leads...
            </td>
          </tr>
          <tr v-else-if="leads.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-500">
              Nenhum lead encontrado com os filtros selecionados.
            </td>
          </tr>
          <tr
            v-for="lead in leads"
            :key="lead.id"
            class="hover:bg-gray-50/80 transition-colors cursor-pointer"
            @click="$emit('select-lead', lead.id)"
          >
            <td class="px-4 py-3">
              <div class="font-semibold text-gray-900">{{ lead.full_name }}</div>
              <div v-if="lead.company_or_condominium" class="text-xs text-gray-500">{{ lead.company_or_condominium }}</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-gray-800">{{ lead.phone }}</div>
              <div v-if="lead.email" class="text-xs text-gray-500">{{ lead.email }}</div>
            </td>
            <td class="px-4 py-3">
              <div v-if="lead.service_name" class="font-medium text-blue-900">{{ lead.service_name }}</div>
              <div class="text-xs text-gray-500">{{ lead.form_id === 'contact_form' ? 'Formulário de Contato' : 'Modal de Orçamento' }}</div>
            </td>
            <td class="px-4 py-3">
              <LeadStatusBadge :status="lead.status" />
            </td>
            <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
              {{ formatDate(lead.created_at) }}
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button
                class="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                @click.stop="$emit('select-lead', lead.id)"
              >
                Ver Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="px-4 py-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
      <div>
        Total de <span class="font-semibold">{{ total }}</span> leads
      </div>
      <div class="flex items-center space-x-2">
        <button
          :disabled="currentPage <= 1"
          class="px-2.5 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-40"
          @click="$emit('change-page', currentPage - 1)"
        >
          Anterior
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button
          :disabled="currentPage >= totalPages"
          class="px-2.5 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-40"
          @click="$emit('change-page', currentPage + 1)"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>
