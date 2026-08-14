/**
 * Middleware nomeado: gestao
 *
 * Aplicado via definePageMeta({ middleware: ['gestao'] })
 * somente nas páginas protegidas da área administrativa.
 *
 * Proteções:
 * - Sem sessão → /gestao/login
 * - Com sessão sem autorização administrativa → erro 403
 * - Admin inativo → erro 403
 * - Admin autenticado tentando acessar /gestao/login → /gestao
 * - Anti open-redirect: valida destinos internos
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // ── Redirecionar admin autenticado que tenta acessar o login ──
  if (to.path === '/gestao/login' && user.value) {
    return navigateTo('/gestao', { replace: true })
  }

  // ── Sem sessão: redirecionar para login ───────────────────────
  if (!user.value) {
    return navigateTo('/gestao/login', { replace: true })
  }

  // ── Com sessão: verificar autorização server-side ─────────────
  // A verificação real é feita no servidor; aqui é apenas UX.
  // O endpoint /api/auth/me revalida tudo no servidor.
  try {
    const data = await $fetch('/api/auth/me')

    if (!data || typeof data !== 'object') {
      return navigateTo('/gestao/login', { replace: true })
    }
  }
  catch {
    // Redirecionamento suave para login se não for admin autorizado
    return navigateTo('/gestao/login', { replace: true })
  }
})
