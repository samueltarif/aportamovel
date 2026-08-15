<script setup lang="ts">
import type { LeadStatus } from '~~/shared/types/leads'

const props = defineProps<{
  status: LeadStatus
}>()

const statusMap: Record<LeadStatus, { label: string; class: string }> = {
  new: { label: 'Novo', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'Em Contato', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  qualified: { label: 'Qualificado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  proposal_sent: { label: 'Proposta Enviada', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  won: { label: 'Ganho', class: 'bg-green-50 text-green-700 border-green-200' },
  lost: { label: 'Perdido', class: 'bg-gray-100 text-gray-700 border-gray-200' },
  spam: { label: 'Spam', class: 'bg-red-50 text-red-700 border-red-200' },
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
    :class="statusMap[status]?.class || 'bg-gray-100 text-gray-700 border-gray-200'"
  >
    {{ statusMap[status]?.label || status }}
  </span>
</template>
