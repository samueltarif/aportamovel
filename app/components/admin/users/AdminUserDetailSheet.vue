<script setup lang="ts">
import { X, Shield, UserCheck, Power, Send, Calendar, Clock, AlertTriangle, Loader2 } from '@lucide/vue'
import type { AdminUserItem, AdminUserRole } from '~~/shared/types/adminUsers'
import AdminUserStatusBadge from './AdminUserStatusBadge.vue'

interface Props {
  user: AdminUserItem | null
  open: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateRole', role: AdminUserRole): void
  (e: 'updateStatus', isActive: boolean): void
  (e: 'resend'): void
}>()

const formatDate = (isoStr?: string | null) => {
  if (!isoStr) return 'Não registrado'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(isoStr))
  }
  catch {
    return '—'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150">
      <div v-if="open && user" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end" @click.self="emit('close')">
        <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200" role="dialog" aria-modal="true">
          <!-- Topo da Drawer -->
          <div class="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-900">Detalhes do Administrador</span>
            </div>
            <button type="button" class="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors" @click="emit('close')">
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Header do Usuário -->
            <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div class="h-12 w-12 rounded-full bg-[#09357a]/10 border border-[#09357a]/20 flex items-center justify-center text-[#09357a] font-bold text-base shrink-0">
                {{ user.email.slice(0, 2).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-sm text-slate-900 truncate" :title="user.email">{{ user.email }}</span>
                <span class="text-xs text-slate-400 font-mono">ID: {{ user.id }}</span>
              </div>
            </div>

            <!-- Dados de Status e Papel -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Atual</span>
                <div><AdminUserStatusBadge :status="user.status" /></div>
              </div>
              <div class="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Função</span>
                <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                  <component :is="user.role === 'admin' ? Shield : UserCheck" class="h-3.5 w-3.5 text-indigo-600" />
                  <span>{{ user.role === 'admin' ? 'Administrador' : 'Editor' }}</span>
                </div>
              </div>
            </div>

            <!-- Metadados de Data -->
            <div class="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5 text-xs text-slate-600">
              <div class="flex items-center justify-between">
                <span class="text-slate-400 flex items-center gap-1.5"><Calendar class="h-3.5 w-3.5" /> Criado em:</span>
                <span class="font-medium text-slate-800">{{ formatDate(user.created_at) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400 flex items-center gap-1.5"><Clock class="h-3.5 w-3.5" /> Aceito em:</span>
                <span class="font-medium text-slate-800">{{ formatDate(user.accepted_at) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400 flex items-center gap-1.5"><Clock class="h-3.5 w-3.5" /> Último Acesso:</span>
                <span class="font-medium text-slate-800">{{ formatDate(user.last_sign_in_at) }}</span>
              </div>
            </div>

            <!-- Ações de Gerenciamento -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Gerenciamento de Acesso</h3>

              <!-- Alterar Papel -->
              <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-800">Função</span>
                  <span class="text-[11px] text-slate-500">
                    {{ user.role === 'admin' ? 'Acesso administrativo total' : 'Acesso de editor' }}
                  </span>
                </div>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                  :disabled="loading"
                  @click="emit('updateRole', user.role === 'admin' ? 'editor' : 'admin')"
                >
                  Mudar para {{ user.role === 'admin' ? 'Editor' : 'Admin' }}
                </button>
              </div>

              <!-- Reenviar Convite se Pendente -->
              <div v-if="user.status === 'pending'" class="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-2">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-amber-900">Convite Pendente</span>
                  <span class="text-[11px] text-amber-700">Aguardando confirmação do usuário</span>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-100 text-xs font-bold text-amber-900 hover:bg-amber-200 transition-colors disabled:opacity-50"
                  :disabled="loading"
                  @click="emit('resend')"
                >
                  <Send class="h-3 w-3" />
                  <span>Reenviar</span>
                </button>
              </div>

              <!-- Ativar / Desativar (Apenas se aceito) -->
              <div v-if="user.status !== 'pending'" class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-800">{{ user.is_active ? 'Conta Ativa' : 'Conta Desativada' }}</span>
                  <span class="text-[11px] text-slate-500">
                    {{ user.is_active ? 'Permite login no painel' : 'Bloqueia login no painel' }}
                  </span>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  :class="user.is_active ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'"
                  :disabled="loading"
                  @click="emit('updateStatus', !user.is_active)"
                >
                  <Power class="h-3 w-3" />
                  <span>{{ user.is_active ? 'Desativar' : 'Ativar' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
