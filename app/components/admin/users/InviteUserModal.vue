<script setup lang="ts">
import { X, Send, Shield, UserCheck, AlertCircle, Loader2 } from '@lucide/vue'
import { inviteAdminSchema } from '~~/server/validators/adminUserSchemas'
import type { AdminUserRole } from '~~/shared/types/adminUsers'

interface Props {
  open: boolean
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { email: string; role: AdminUserRole }): void
}>()

const email = ref('')
const role = ref<AdminUserRole>('editor')
const formError = ref<string | null>(null)

const handleSubmit = () => {
  formError.value = null
  const parsed = inviteAdminSchema.safeParse({ email: email.value, role: role.value })
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    formError.value = firstIssue?.message || 'Dados inválidos.'
    return
  }
  emit('submit', parsed.data)
}

const handleClose = () => {
  email.value = ''
  role.value = 'editor'
  formError.value = null
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" leave-active-class="transition-opacity duration-100">
      <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" @click.self="handleClose">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
          <!-- Topo do Modal -->
          <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="h-8 w-8 rounded-lg bg-[#09357a]/10 flex items-center justify-center text-[#09357a]">
                <Send class="h-4 w-4" />
              </div>
              <h2 id="invite-modal-title" class="text-base font-bold text-slate-900">
                Convidar Administrador
              </h2>
            </div>
            <button
              type="button"
              class="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Fechar"
              @click="handleClose"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Formulário -->
          <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
            <div v-if="formError" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
              <span>{{ formError }}</span>
            </div>

            <div>
              <label for="invite-email" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail do Convidado <span class="text-red-500">*</span>
              </label>
              <input
                id="invite-email"
                v-model="email"
                type="email"
                required
                placeholder="exemplo@aportamovel.com.br"
                class="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09357a] focus:border-transparent transition-all"
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Função de Acesso <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  class="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-xs font-semibold"
                  :class="role === 'editor' ? 'border-[#09357a] bg-[#09357a]/5 text-[#09357a]' : 'border-slate-200 hover:border-slate-300 text-slate-700'"
                >
                  <input v-model="role" type="radio" value="editor" name="role" class="sr-only" />
                  <UserCheck class="h-4 w-4 shrink-0" />
                  <div class="flex flex-col">
                    <span>Editor</span>
                    <span class="text-[10px] font-normal text-slate-500">Publicações e Serviços</span>
                  </div>
                </label>

                <label
                  class="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-xs font-semibold"
                  :class="role === 'admin' ? 'border-[#09357a] bg-[#09357a]/5 text-[#09357a]' : 'border-slate-200 hover:border-slate-300 text-slate-700'"
                >
                  <input v-model="role" type="radio" value="admin" name="role" class="sr-only" />
                  <Shield class="h-4 w-4 shrink-0" />
                  <div class="flex flex-col">
                    <span>Administrador</span>
                    <span class="text-[10px] font-normal text-slate-500">Controle Total</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                :disabled="loading"
                @click="handleClose"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#09357a] text-white text-xs font-semibold hover:bg-[#072a61] transition-colors shadow-xs disabled:opacity-50"
                :disabled="loading"
              >
                <Loader2 v-if="loading" class="h-3.5 w-3.5 animate-spin" />
                <Send v-else class="h-3.5 w-3.5" />
                <span>{{ loading ? 'Enviando convite…' : 'Enviar Convite' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
