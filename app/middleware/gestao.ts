/**
 * Middleware nomeado: gestao
 *
 * Aplicado via definePageMeta({ middleware: ['gestao'] })
 * nas páginas protegidas da área administrativa.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Rota pública de onboarding/aceite não passa pelas travas do painel
  if (to.path === '/gestao/aceitar-convite') {
    return
  }

  const user = useSupabaseUser()

  // Redirecionar admin autenticado que tenta acessar o login
  if (to.path === '/gestao/login' && user.value) {
    return navigateTo('/gestao', { replace: true })
  }

  // Sem sessão: redirecionar para login
  if (!user.value) {
    return navigateTo('/gestao/login', { replace: true })
  }

  // Com sessão: verificar autorização server-side via /api/auth/me
  try {
    const data = await $fetch<{ email: string; role: string; is_active?: boolean; code?: string }>('/api/auth/me')

    if (!data || typeof data !== 'object') {
      return navigateTo('/gestao/login', { replace: true })
    }

    // Se o convite está pendente, redireciona para a página de aceite
    if (data.code === 'ADMIN_INVITE_PENDING') {
      return navigateTo('/gestao/aceitar-convite', { replace: true })
    }

    // Se editor tentar acessar rota exclusiva de administrador (/gestao/administradores)
    if (to.path === '/gestao/administradores' && data.role !== 'admin') {
      return navigateTo('/gestao', { replace: true })
    }
  }
  catch {
    return navigateTo('/gestao/login', { replace: true })
  }
})
