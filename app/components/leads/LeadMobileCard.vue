<script setup lang="ts">
import type { Lead } from '~~/shared/types/leads'
import LeadStatusBadge from './LeadStatusBadge.vue'

defineProps<{
  lead: Lead
}>()

defineEmits<{
  (e: 'select-lead', id: string): void
}>()

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div
    class="bg-white border rounded-xl p-4 shadow-sm space-y-3 cursor-pointer hover:border-blue-300 transition-colors"
    @click="$emit('select-lead', lead.id)"
  >
    <div class="flex items-start justify-between">
      <div>
        <h4 class="font-semibold text-gray-900 leading-tight">{{ lead.full_name }}</h4>
        <p v-if="lead.company_or_condominium" class="text-xs text-gray-500 mt-0.5">{{ lead.company_or_condominium }}</p>
      </div>
      <LeadStatusBadge :status="lead.status" />
    </div>

    <div class="text-xs text-gray-700 space-y-1 bg-gray-50 p-2.5 rounded-lg">
      <div><span class="font-medium text-gray-500">Telefone:</span> {{ lead.phone }}</div>
      <div v-if="lead.email"><span class="font-medium text-gray-500">E-mail:</span> {{ lead.email }}</div>
      <div v-if="lead.service_name"><span class="font-medium text-gray-500">Serviço:</span> {{ lead.service_name }}</div>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500 pt-1 border-t">
      <span>{{ formatDate(lead.created_at) }}</span>
      <span class="text-blue-600 font-semibold">Ver Detalhes →</span>
    </div>
  </div>
</template>
