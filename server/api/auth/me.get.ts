import { createError, defineEventHandler } from 'h3'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { getAdminUser, type AdminUser } from '../../services/adminService'

/**
 * GET /api/auth/me
 *
 * Retorna os dados do administrador autenticado.
 * Trata o estado de convite pendente retornando código 'ADMIN_INVITE_PENDING'
 * para que o frontend/middleware possa direcionar para /gestao/aceitar-convite.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Não autenticado.',
    })
  }

  const userId = (user.id || (user as any).sub) as string
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Não autenticado.',
    })
  }

  const client = await serverSupabaseClient(event)
  const adminUser: AdminUser | null = await getAdminUser(client, userId)

  if (!adminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Você não possui autorização para acessar este painel.',
    })
  }

  // Convite pendente: retorna 200 com código para roteamento controlado pelo middleware
  if (adminUser.accepted_at === null) {
    return {
      email: user.email ?? '',
      role: adminUser.role,
      is_active: false,
      accepted_at: null,
      status: 'pending',
      code: 'ADMIN_INVITE_PENDING',
    }
  }

  if (!adminUser.is_active) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Sua conta administrativa está inativa.',
    })
  }

  return {
    email: user.email ?? '',
    role: adminUser.role,
    is_active: true,
    accepted_at: adminUser.accepted_at,
    status: 'active',
  }
})
