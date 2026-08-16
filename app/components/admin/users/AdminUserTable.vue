<script setup lang="ts">
import { Send, Eye, Shield, UserCheck } from '@lucide/vue'
import type { AdminUserItem } from '~~/shared/types/adminUsers'
import AdminUserStatusBadge from './AdminUserStatusBadge.vue'

interface Props {
  users: AdminUserItem[]
  loading?: boolean
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoStr))
  }
  catch {
    return '—'
  }
}
</script>

<template>
  <div class="hidden md:block overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
      <thead class="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <tr>
          <th scope="col" class="px-5 py-3.5">Administrador</th>
          <th scope="col" class="px-5 py-3.5">Função</th>
          <th scope="col" class="px-5 py-3.5">Status</th>
          <th scope="col" class="px-5 py-3.5">Criação / Convite</th>
          <th scope="col" class="px-5 py-3.5">Último Acesso</th>
          <th scope="col" class="px-5 py-3.5 text-right">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr
          v-for="user in users"
          :key="user.id"
          class="hover:bg-slate-50/70 transition-colors group cursor-pointer"
          @click="emit('selectUser', user)"
        >
          <td class="px-5 py-4 whitespace-nowrap">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 group-hover:bg-[#09357a]/10 group-hover:text-[#09357a] transition-colors">
                {{ user.email.slice(0, 2).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-slate-900 truncate max-w-[200px]" :title="user.email">
                  {{ user.email }}
                </span>
                <span class="text-[11px] text-slate-400 font-mono truncate">
                  ID: {{ user.id.slice(0, 8) }}…
                </span>
              </div>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border"
              :class="user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'"
            >
              <component :is="user.role === 'admin' ? Shield : UserCheck" class="h-3 w-3" />
              {{ user.role === 'admin' ? 'Administrador' : 'Editor' }}
            </span>
          </td>

          <td class="px-5 py-4 whitespace-nowrap">
            <AdminUserStatusBadge :status="user.status" />
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
            {{ formatDate(user.created_at) }}
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
            {{ formatDate(user.last_sign_in_at) }}
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-right text-xs font-medium space-x-1" @click.stop>
            <button
              v-if="user.status === 'pending'"
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Reenviar e-mail de convite"
              @click="emit('resend', user)"
            >
              <Send class="h-3.5 w-3.5" />
              <span>Reenviar</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#09357a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
              title="Ver detalhes do administrador"
              @click="emit('selectUser', user)"
            >
              <Eye class="h-3.5 w-3.5" />
              <span>Detalhes</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
