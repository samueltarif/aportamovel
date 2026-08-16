<script setup lang="ts">
import { X, ShieldAlert, ChevronLeft, ChevronRight, Loader2, Activity } from '@lucide/vue'
import type { AdminUserAuditItem, AdminUsersPagination } from '~~/shared/types/adminUsers'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { fetchAudit } = useAdminUsers()
const items = ref<AdminUserAuditItem[]>([])
const loading = ref(false)
const page = ref(1)
const pagination = ref<AdminUsersPagination>({ page: 1, limit: 15, total: 0, totalPages: 1 })

const loadAudit = async (p = 1) => {
  loading.value = true
  try {
    const res = await fetchAudit(p, 15)
    items.value = res.items
    pagination.value = res.pagination
    page.value = p
  } catch (err) {
    console.error('Erro ao carregar auditoria:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) loadAudit(1)
})

const actionLabels: Record<string, { label: string; class: string }> = {
  invited: { label: 'Convite Criado', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  invite_resent: { label: 'Convite Reenviado', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  invite_accepted: { label: 'Convite Aceito', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  role_changed: { label: 'Função Alterada', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  activated: { label: 'Conta Ativada', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  deactivated: { label: 'Conta Desativada', class: 'bg-red-50 text-red-700 border-red-200' },
}

const formatDate = (isoStr: string) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date(isoStr))
  } catch {
    return isoStr
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" leave-active-class="transition-opacity duration-100">
      <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" @click.self="emit('close')">
        <div class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
          <!-- Header -->
          <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="h-8 w-8 rounded-lg bg-[#09357a]/10 flex items-center justify-center text-[#09357a]">
                <Activity class="h-4 w-4" />
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-900">Trilha de Auditoria Imutável</h2>
                <p class="text-xs text-slate-500">Histórico de ações administrativas registradas</p>
              </div>
            </div>
            <button type="button" class="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors" @click="emit('close')">
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 class="h-6 w-6 animate-spin text-[#09357a]" />
              <span class="text-xs font-semibold">Carregando logs de auditoria…</span>
            </div>

            <div v-else-if="items.length === 0" class="py-12 text-center text-xs text-slate-500">
              Nenhum registro de auditoria encontrado.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="item in items"
                :key="item.id"
                class="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md font-bold text-[11px] border" :class="actionLabels[item.action]?.class || 'bg-slate-100 text-slate-700'">
                      {{ actionLabels[item.action]?.label || item.action }}
                    </span>
                    <span class="font-bold text-slate-900 truncate" :title="item.target_email">
                      {{ item.target_email || item.target_user_id }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500">
                    Executado por: <span class="font-medium text-slate-700">{{ item.actor_email || item.actor_user_id }}</span>
                    <span v-if="item.old_role && item.new_role" class="ml-2 font-medium text-purple-700">
                      ({{ item.old_role }} &rarr; {{ item.new_role }})
                    </span>
                  </div>
                </div>

                <span class="text-[11px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                  {{ formatDate(item.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer Pagination -->
          <div v-if="pagination.totalPages > 1" class="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>Página {{ pagination.page }} de {{ pagination.totalPages }} (Total: {{ pagination.total }})</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                :disabled="page <= 1 || loading"
                @click="loadAudit(page - 1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                :disabled="page >= pagination.totalPages || loading"
                @click="loadAudit(page + 1)"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
