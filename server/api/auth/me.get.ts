import { requireAdmin } from '../../utils/requireAdmin'

/**
 * GET /api/auth/me
 *
 * Retorna os dados do administrador autenticado.
 * Requer sessão válida E registro ativo em admin_users.
 *
 * Resposta de sucesso: { email, role }
 * Erro 401: sem sessão
 * Erro 403: sessão sem autorização administrativa
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  // Retornar somente o mínimo necessário — sem userId, sem tokens
  return {
    email: admin.email,
    role: admin.role,
  }
})
