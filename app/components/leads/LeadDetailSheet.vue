<script setup lang="ts">
import { ref } from 'vue'
import type { LeadDetail, LeadStatus } from '~~/shared/types/leads'
import LeadStatusBadge from './LeadStatusBadge.vue'

const props = defineProps<{
  lead: LeadDetail | null
  isOpen: boolean
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update-status', status: LeadStatus): void
  (e: 'add-note', note: string): void
  (e: 'toggle-archive', archived: boolean): void
}>()

const newNote = ref('')
const isSavingNote = ref(false)

const handleAddNote = () => {
  if (!newNote.value.trim()) return
  isSavingNote.value = true
  emit('add-note', newNote.value.trim())
  newNote.value = ''
  isSavingNote.value = false
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Em Contato' },
  { value: 'qualified', label: 'Qualificado' },
  { value: 'proposal_sent', label: 'Proposta Enviada' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' },
  { value: 'spam', label: 'Spam' },
]
</script>

<template>
  <div
    v-if="isOpen && lead"
    class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
    @click.self="$emit('close')"
  >
    <div class="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      <!-- Header -->
      <div class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900">{{ lead.full_name }}</h3>
          <p class="text-xs text-gray-500">Cadastrado em {{ formatDate(lead.created_at) }}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold" @click="$emit('close')">✕</button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Status e Ações Rápidas -->
        <div class="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-gray-600">Status Atual:</span>
            <select
              :value="lead.status"
              class="text-xs font-semibold bg-white border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
              @change="$emit('update-status', ($event.target as HTMLSelectElement).value as LeadStatus)"
            >
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-blue-200/60">
            <a
              :href="`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`"
              target="_blank"
              class="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Abrir WhatsApp
            </a>
            <a
              :href="`tel:${lead.phone.replace(/[^0-9]/g, '')}`"
              class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors"
            >
              Ligar
            </a>
            <a
              v-if="lead.email"
              :href="`mailto:${lead.email}`"
              class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors"
            >
              E-mail
            </a>
          </div>
        </div>

        <!-- Dados do Lead -->
        <div class="space-y-2 text-sm">
          <h4 class="text-xs font-bold uppercase text-gray-500 tracking-wider">Informações de Contato</h4>
          <div class="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
            <div><span class="text-gray-500">Telefone:</span> <span class="font-semibold text-gray-800">{{ lead.phone }}</span></div>
            <div><span class="text-gray-500">E-mail:</span> <span class="font-semibold text-gray-800">{{ lead.email || 'Não informado' }}</span></div>
            <div><span class="text-gray-500">Empresa/Cond.:</span> <span class="font-semibold text-gray-800">{{ lead.company_or_condominium || 'Não informado' }}</span></div>
            <div><span class="text-gray-500">Serviço:</span> <span class="font-semibold text-gray-800">{{ lead.service_name || 'Geral' }}</span></div>
            <div><span class="text-gray-500">Origem:</span> <span class="font-semibold text-gray-800">{{ lead.source_path }}</span></div>
            <div><span class="text-gray-500">Campanha UTM:</span> <span class="font-semibold text-gray-800">{{ lead.utm_campaign || 'Orgânico' }}</span></div>
          </div>
        </div>

        <!-- Mensagem -->
        <div v-if="lead.message" class="space-y-1 text-sm">
          <h4 class="text-xs font-bold uppercase text-gray-500 tracking-wider">Mensagem / Escopo</h4>
          <div class="bg-gray-50 p-4 rounded-xl text-xs text-gray-800 whitespace-pre-wrap">{{ lead.message }}</div>
        </div>

        <!-- Observações Internas -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase text-gray-500 tracking-wider">Observações da Equipe</h4>
          <div class="flex gap-2">
            <input
              v-model="newNote"
              type="text"
              placeholder="Adicionar nota de atendimento..."
              class="flex-1 px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              @keydown.enter.prevent="handleAddNote"
            >
            <button
              :disabled="!newNote.trim() || isSavingNote"
              class="px-4 py-2 bg-[#09357a] text-white text-xs font-bold rounded-lg disabled:opacity-50"
              @click="handleAddNote"
            >
              Salvar
            </button>
          </div>

          <div v-if="lead.notes && lead.notes.length > 0" class="space-y-2">
            <div v-for="n in lead.notes" :key="n.id" class="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
              <p class="text-gray-800">{{ n.note }}</p>
              <p class="text-[10px] text-gray-400">{{ formatDate(n.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Histórico de Status -->
        <div v-if="lead.history && lead.history.length > 0" class="space-y-2">
          <h4 class="text-xs font-bold uppercase text-gray-500 tracking-wider">Histórico de Alterações</h4>
          <div class="space-y-1.5 border-l-2 border-gray-200 pl-3">
            <div v-for="h in lead.history" :key="h.id" class="text-xs text-gray-600">
              Mudou para <span class="font-bold">{{ h.new_status }}</span> em {{ formatDate(h.created_at) }}
            </div>
          </div>
        </div>

        <!-- Arquivar (Apenas Admin) -->
        <div v-if="isAdmin" class="pt-4 border-t flex justify-end">
          <button
            class="text-xs font-semibold text-gray-500 hover:text-red-600"
            @click="$emit('toggle-archive', !lead.archived_at)"
          >
            {{ lead.archived_at ? 'Restaurar lead' : 'Arquivar este lead' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
