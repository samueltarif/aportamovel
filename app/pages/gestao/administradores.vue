<script setup lang="ts">
import { Users, UserPlus, Shield, Clock, Search, Activity, ChevronLeft, ChevronRight, Loader2 } from '@lucide/vue'
import type { AdminUserItem, AdminUserRole } from '~~/shared/types/adminUsers'
import AdminUserTable from '~/components/admin/users/AdminUserTable.vue'
import AdminUserMobileCard from '~/components/admin/users/AdminUserMobileCard.vue'
import InviteUserModal from '~/components/admin/users/InviteUserModal.vue'
import AdminUserDetailSheet from '~/components/admin/users/AdminUserDetailSheet.vue'
import AdminAuditLog from '~/components/admin/users/AdminAuditLog.vue'

definePageMeta({ layout: 'gestao', middleware: ['gestao'] })
useHead({ title: 'Gestão de Administradores | Painel A Portamóvel' })

const {
  users, loading, actionLoading, summary, pagination, search, selectedRole, selectedStatus, page,
  fetchUsers, inviteUser, resendInvite, updateRole, updateStatus,
} = useAdminUsers()

const isInviteModalOpen = ref(false)
const isAuditLogOpen = ref(false)
const selectedUser = ref<AdminUserItem | null>(null)
const isDetailOpen = ref(false)
const feedbackMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
  feedbackMessage.value = { text, type }
  setTimeout(() => { feedbackMessage.value = null }, 5000)
}

onMounted(() => { fetchUsers() })
const handleSearch = () => { page.value = 1; fetchUsers() }
const handleOpenDetail = (user: AdminUserItem) => { selectedUser.value = user; isDetailOpen.value = true }

const handleInviteSubmit = async (data: { email: string; role: AdminUserRole }) => {
  try {
    const res = await inviteUser(data.email, data.role)
    isInviteModalOpen.value = false
    showFeedback(res.message || 'Convite enviado com sucesso!', 'success')
  } catch (err: any) {
    showFeedback(err.message || 'Erro ao enviar convite.', 'error')
  }
}

const handleResend = async (user?: AdminUserItem) => {
  const target = user || selectedUser.value
  if (!target) return
  try {
    const res = await resendInvite(target.id)
    showFeedback(res.message || 'Convite reenviado com sucesso!', 'success')
  } catch (err: any) {
    showFeedback(err.message || 'Erro ao reenviar convite.', 'error')
  }
}

const handleUpdateRole = async (role: AdminUserRole) => {
  if (!selectedUser.value) return
  try {
    await updateRole(selectedUser.value.id, role)
    selectedUser.value.role = role
    showFeedback('Função alterada com sucesso!', 'success')
  } catch (err: any) {
    showFeedback(err.message || 'Erro ao alterar função.', 'error')
  }
}

const handleUpdateStatus = async (isActive: boolean) => {
  if (!selectedUser.value) return
  try {
    await updateStatus(selectedUser.value.id, isActive)
    selectedUser.value.is_active = isActive
    selectedUser.value.status = isActive ? 'active' : 'inactive'
    showFeedback(`Conta ${isActive ? 'ativada' : 'desativada'} com sucesso!`, 'success')
  } catch (err: any) {
    showFeedback(err.message || 'Erro ao alterar status.', 'error')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="feedbackMessage" class="p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-xs" :class="feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'">
      <span>{{ feedbackMessage.text }}</span>
      <button type="button" class="underline" @click="feedbackMessage = null">Fechar</button>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Gestão de Administradores</h1>
        <p class="text-xs text-slate-500 mt-1">Gerencie convites, funções de acesso e auditoria do painel.</p>
      </div>
      <div class="flex items-center gap-2.5">
        <button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs" @click="isAuditLogOpen = true">
          <Activity class="h-4 w-4 text-slate-500" />
          <span>Auditoria</span>
        </button>
        <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09357a] text-white text-xs font-bold hover:bg-[#072a61] shadow-xs" @click="isInviteModalOpen = true">
          <UserPlus class="h-4 w-4" />
          <span>Convidar</span>
        </button>
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Shield class="h-5 w-5" /></div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admins Ativos</span>
          <p class="text-xl font-extrabold text-slate-900 leading-tight">{{ summary.active_admins }}</p>
        </div>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"><Users class="h-5 w-5" /></div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Editores Ativos</span>
          <p class="text-xl font-extrabold text-slate-900 leading-tight">{{ summary.active_editors }}</p>
        </div>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Clock class="h-5 w-5" /></div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Convites Pendentes</span>
          <p class="text-xl font-extrabold text-slate-900 leading-tight">{{ summary.pending_invites }}</p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input v-model="search" type="text" placeholder="Buscar por e-mail…" class="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#09357a]" @input="handleSearch" />
      </div>
      <select v-model="selectedRole" class="h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700" @change="handleSearch">
        <option value="all">Todas as funções</option>
        <option value="admin">Administrador</option>
        <option value="editor">Editor</option>
      </select>
      <select v-model="selectedStatus" class="h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700" @change="handleSearch">
        <option value="all">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="pending">Pendente</option>
        <option value="inactive">Inativo</option>
      </select>
    </div>

    <!-- Lista / Tabela -->
    <div v-if="loading" class="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
      <Loader2 class="h-8 w-8 animate-spin text-[#09357a]" />
      <span class="text-xs font-semibold">Carregando administradores…</span>
    </div>
    <div v-else-if="users.length === 0" class="py-16 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
      Nenhum administrador encontrado com os filtros aplicados.
    </div>
    <div v-else class="space-y-4">
      <AdminUserTable :users="users" :loading="actionLoading" @select-user="handleOpenDetail" @resend="handleResend" />
      <div class="md:hidden space-y-3">
        <AdminUserMobileCard v-for="u in users" :key="u.id" :user="u" @select-user="handleOpenDetail" @resend="handleResend" />
      </div>

      <div v-if="pagination.totalPages > 1" class="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span>Página {{ pagination.page }} de {{ pagination.totalPages }} (Total: {{ pagination.total }})</span>
        <div class="flex items-center gap-2">
          <button type="button" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40" :disabled="page <= 1 || loading" @click="page--; fetchUsers()">
            <ChevronLeft class="h-4 w-4" />
          </button>
          <button type="button" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40" :disabled="page >= pagination.totalPages || loading" @click="page++; fetchUsers()">
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <InviteUserModal :open="isInviteModalOpen" :loading="actionLoading" @close="isInviteModalOpen = false" @submit="handleInviteSubmit" />
    <AdminUserDetailSheet :user="selectedUser" :open="isDetailOpen" :loading="actionLoading" @close="isDetailOpen = false" @update-role="handleUpdateRole" @update-status="handleUpdateStatus" @resend="handleResend()" />
    <AdminAuditLog :open="isAuditLogOpen" @close="isAuditLogOpen = false" />
  </div>
</template>
