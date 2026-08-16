<script setup lang="ts">
import { Send, Eye, Shield, UserCheck, Calendar, Clock } from '@lucide/vue'
import type { AdminUserItem } from '~~/shared/types/adminUsers'
import AdminUserStatusBadge from './AdminUserStatusBadge.vue'

interface Props {
  user: AdminUserItem
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'selectUser', user: AdminUserItem): void
  (e: 'resend', user: AdminUserItem): void
}>()

const formatDate = (isoStr?: string | null) => {
  if (!isoStr) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(isoStr))
  }
  catch {
    return '—'
  }
}
</script>

<template>
  <div
    class="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition-all space-y-3"
    @click="emit('selectUser', user)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
          {{ user.email.slice(0, 2).toUpperCase() }}
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-bold text-sm text-slate-900 truncate" :title="user.email">
            {{ user.email }}
          </span>
          <span class="text-[11px] text-slate-400 font-mono">
            ID: {{ user.id.slice(0, 8) }}…
          </span>
        </div>
      </div>
      <AdminUserStatusBadge :status="user.status" />
    </div>

    <div class="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
      <div class="flex items-center gap-1.5 truncate">
        <component :is="user.role === 'admin' ? Shield : UserCheck" class="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span class="truncate">{{ user.role === 'admin' ? 'Administrador' : 'Editor' }}</span>
      </div>
      <div class="flex items-center gap-1.5 truncate">
        <Calendar class="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span class="truncate">Criado: {{ formatDate(user.created_at) }}</span>
      </div>
      <div v-if="user.last_sign_in_at" class="col-span-2 flex items-center gap-1.5 truncate text-[11px] text-slate-400">
        <Clock class="h-3.5 w-3.5 shrink-0" />
        <span class="truncate">Último acesso: {{ formatDate(user.last_sign_in_at) }}</span>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100" @click.stop>
      <button
        v-if="user.status === 'pending'"
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
        @click="emit('resend', user)"
      >
        <Send class="h-3.5 w-3.5" />
        <span>Reenviar</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:text-[#09357a] transition-colors"
        @click="emit('selectUser', user)"
      >
        <Eye class="h-3.5 w-3.5" />
        <span>Detalhes</span>
      </button>
    </div>
  </div>
</template>
