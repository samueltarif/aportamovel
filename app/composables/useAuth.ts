import type { LoginInput, RecoverPasswordInput } from '../../shared/schemas/auth'

// Mensagens amigáveis — nunca revela detalhes internos
const MSG_LOGIN_ERROR = 'E-mail ou senha inválidos.'
const MSG_GENERIC_ERROR = 'Não foi possível realizar o acesso. Tente novamente.'
const MSG_RECOVER_SENT = 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.'

/**
 * Composable de autenticação administrativa.
 *
 * Responsabilidades:
 * - Login por e-mail/senha
 * - Logout seguro
 * - Recuperação de senha (resposta genérica)
 *
 * O estado de recuperação de senha (PASSWORD_RECOVERY)
 * é tratado exclusivamente em ResetPasswordForm.vue
 * para evitar múltiplas subscriptions.
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Login ──────────────────────────────────────────────────
  async function login(credentials: LoginInput): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        // Nunca revelar se é o email ou a senha que está errado
        error.value = MSG_LOGIN_ERROR
        return false
      }

      // Validar imediatamente no servidor se o usuário é administrador ativo
      try {
        const adminData = await $fetch('/api/auth/me')
        if (!adminData) {
          await supabase.auth.signOut()
          error.value = 'Você não possui autorização para acessar este painel.'
          return false
        }
      }
      catch {
        await supabase.auth.signOut()
        error.value = 'Você não possui autorização para acessar este painel.'
        return false
      }

      return true
    }
    catch {
      error.value = MSG_GENERIC_ERROR
      return false
    }
    finally {
      loading.value = false
    }
  }

  // ─── Logout ─────────────────────────────────────────────────
  async function logout(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await supabase.auth.signOut()
    }
    finally {
      loading.value = false
    }

    // Redirecionar após encerrar a sessão completamente
    await navigateTo('/gestao/login', { replace: true })
  }

  // ─── Recuperação de senha ────────────────────────────────────
  async function recoverPassword(data: RecoverPasswordInput): Promise<string> {
    loading.value = true
    error.value = null

    try {
      const origin = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : useRequestURL().origin

      const redirectTo = `${origin}/gestao/redefinir-senha`

      // Sempre retornar resposta genérica para não revelar se o email existe
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      })

      return MSG_RECOVER_SENT
    }
    catch {
      // Mesmo em caso de erro de rede, retornar mensagem genérica
      return MSG_RECOVER_SENT
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    login,
    logout,
    recoverPassword,
  }
}
