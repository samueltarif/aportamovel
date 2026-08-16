<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

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
  <div v-if="isOpen && lead" class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs" @click.self="$emit('close')">
    <div class="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      <!-- Header com Botão Voltar -->
      <div class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between gap-3">
        <div class="flex items-center space-x-3 min-w-0">
          <button type="button" class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all" @click="$emit('close')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Voltar</span>
          </button>
          <div class="min-w-0">
            <h3 class="text-base font-bold text-gray-900 truncate">{{ lead.full_name }}</h3>
            <p class="text-[11px] text-gray-500 truncate">Cadastrado em {{ formatDate(lead.created_at) }}</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold" @click="$emit('close')">&times;</button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Status Atual & Alteração -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-gray-500">Status Atual</span>
            <LeadStatusBadge :status="lead.status" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Alterar Status</label>
            <select :value="lead.status" class="w-full text-xs font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white" @change="emit('update-status', ($event.target as HTMLSelectElement).value as LeadStatus)">
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <!-- Contato -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase text-gray-500 tracking-wider">Dados de Contato</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-gray-50 p-3 rounded-lg"><span class="text-gray-400 block mb-0.5">Telefone</span><a :href="`tel:${lead.phone}`" class="font-bold text-[#09357a] hover:underline">{{ lead.phone }}</a></div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="text-gray-400 block mb-0.5">Email</span><a :href="`mailto:${lead.email}`" class="font-bold text-[#09357a] hover:underline">{{ lead.email }}</a></div>
          </div>
        </div>

        <!-- Anotações -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase text-gray-500 tracking-wider">Notas Internas</h4>
          <div class="flex gap-2">
            <input v-model="newNote" type="text" placeholder="Adicionar nota..." class="flex-1 text-xs border rounded-lg px-3 py-2" @keyup.enter="handleAddNote" />
            <button :disabled="!newNote.trim() || isSavingNote" class="px-4 py-2 bg-[#09357a] text-white text-xs font-bold rounded-lg disabled:opacity-50" @click="handleAddNote">Salvar</button>
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

        <!-- Arquivar -->
        <div v-if="isAdmin" class="pt-4 border-t flex justify-between items-center">
          <button type="button" class="text-xs font-bold text-slate-600 hover:text-slate-900" @click="$emit('close')">Voltar ao painel</button>
          <button class="text-xs font-semibold text-gray-500 hover:text-red-600" @click="$emit('toggle-archive', !lead.archived_at)">
            {{ lead.archived_at ? 'Restaurar lead' : 'Arquivar este lead' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
