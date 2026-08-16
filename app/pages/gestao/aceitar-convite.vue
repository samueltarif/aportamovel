<script setup lang="ts">
import { ShieldCheck, Lock, AlertCircle, CheckCircle, ArrowRight, Loader2 } from '@lucide/vue'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Aceitar Convite Administrativo | A Portamóvel',
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const type = computed(() => (typeof route.query.type === 'string' ? route.query.type : 'invite'))
const urlError = computed(() => (typeof route.query.error === 'string' ? route.query.error : null))

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const isInviteFlow = computed(() => type.value === 'invite')

const handleSubmit = async () => {
  errorMessage.value = null
  loading.value = true

  try {
    if (isInviteFlow.value) {
      if (!password.value || password.value.length < 8) {
        throw new Error('A senha deve ter no mínimo 8 caracteres.')
      }
      if (password.value !== confirmPassword.value) {
        throw new Error('As senhas digitadas não coincidem.')
      }

      // 1. Atualizar senha no Supabase Auth
      const { error: pwdErr } = await supabase.auth.updateUser({ password: password.value })
      if (pwdErr) {
        const msg = (pwdErr.message || '').toLowerCase()
        // Se a senha digitada já for a mesma do usuário, não impede a ativação do convite
        if (!msg.includes('different from the old password')) {
          throw new Error(pwdErr.message || 'Erro ao definir senha.')
        }
      }
    }

    // 2. Concluir aceite atômico na API
    await $fetch('/api/admin/users/accept-invite', {
      method: 'POST',
      body: {},
    })

    successMessage.value = isInviteFlow.value
      ? 'Senha definida e acesso ativado com sucesso! Redirecionando para o login…'
      : 'Acesso administrativo confirmado com sucesso! Redirecionando para o painel…'

    setTimeout(async () => {
      if (isInviteFlow.value) {
        await supabase.auth.signOut()
        router.push('/gestao/login?accepted=true')
      } else {
        router.push('/gestao')
      }
    }, 2000)
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Erro ao processar ativação do convite.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <img src="/images/logo.png" alt="A Portamóvel" class="mx-auto h-12 w-auto object-contain" width="48" height="48" />
      <h1 class="mt-4 text-2xl font-extrabold text-[#09357a] tracking-tight">A Portamóvel</h1>
      <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Acesso Administrativo</p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
        <!-- Erro de URL / Token inválido -->
        <div v-if="urlError" class="space-y-4 text-center">
          <div class="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle class="h-6 w-6" />
          </div>
          <h2 class="text-base font-bold text-slate-900">Link de convite inválido ou expirado</h2>
          <p class="text-xs text-slate-500">O link utilizado já foi consumido ou perdeu a validade. Solicite um novo convite ao administrador.</p>
          <NuxtLink to="/gestao/login" class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-[#09357a] text-white text-xs font-bold hover:bg-[#072a61] transition-colors">
            Ir para a página de login
          </NuxtLink>
        </div>

        <!-- Sucesso -->
        <div v-else-if="successMessage" class="space-y-4 text-center py-4">
          <div class="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle class="h-6 w-6" />
          </div>
          <h2 class="text-base font-bold text-slate-900">Sucesso!</h2>
          <p class="text-xs text-slate-600 font-medium">{{ successMessage }}</p>
          <div class="flex justify-center"><Loader2 class="h-5 w-5 animate-spin text-[#09357a]" /></div>
        </div>

        <!-- Formulário Normal -->
        <form v-else class="space-y-5" @submit.prevent="handleSubmit">
          <div class="text-center space-y-1">
            <h2 class="text-lg font-bold text-slate-900">
              {{ isInviteFlow ? 'Ativar Conta e Definir Senha' : 'Confirmar Acesso Administrativo' }}
            </h2>
            <p class="text-xs text-slate-500">
              {{ isInviteFlow ? 'Crie sua senha de acesso para ingressar no painel administrativo.' : 'Confirme a concessão de privilégios administrativos para sua conta.' }}
            </p>
          </div>

          <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Campos para Novo Usuário -->
          <div v-if="isInviteFlow" class="space-y-4">
            <div>
              <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nova Senha <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Mínimo 8 caracteres"
                  class="w-full h-10 px-3 pr-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#09357a]"
                  :disabled="loading"
                />
                <Lock class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label for="confirm-password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirmar Senha <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Repita sua senha"
                  class="w-full h-10 px-3 pr-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#09357a]"
                  :disabled="loading"
                />
                <Lock class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <!-- Confirmação para Usuário Preexistente -->
          <div v-else class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <ShieldCheck class="h-8 w-8 text-[#09357a] mx-auto" />
            <p class="text-xs text-slate-700 font-medium">Sua senha existente permanecerá a mesma.</p>
          </div>

          <button
            type="submit"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#09357a] text-white text-xs font-bold hover:bg-[#072a61] transition-colors shadow-xs disabled:opacity-50"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <span v-else>{{ isInviteFlow ? 'Ativar e Definir Senha' : 'Confirmar e Ativar Acesso' }}</span>
            <ArrowRight v-if="!loading" class="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
