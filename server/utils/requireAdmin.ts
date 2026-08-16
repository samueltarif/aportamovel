import type { H3Event } from 'h3'
import { createError } from 'h3'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { getAdminUser, type AdminUser } from '../services/adminService'

export interface AuthorizedAdmin {
  id: string
  userId: string
  email: string
  role: string
  isActive: boolean
  acceptedAt: string | null
}

/**
 * Valida se o usuário atual possui sessão ativa e cadastro administrativo válido.
 * Lança 401 se não autenticado.
 * Lança 403 se não autorizado, inativo ou com convite pendente.
 */
export async function requireAdmin(event: H3Event): Promise<AuthorizedAdmin> {
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

  if (adminUser.accepted_at === null) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Convite administrativo pendente de confirmação.',
      data: { code: 'ADMIN_INVITE_PENDING' },
    })
  }

  if (!adminUser.is_active) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Sua conta administrativa está inativa.',
    })
  }

  return {
    id: userId,
    userId,
    email: user.email ?? '',
    role: adminUser.role,
    isActive: adminUser.is_active,
    acceptedAt: adminUser.accepted_at,
  }
}

/**
 * Guard específico para rotas e ações restritas a funções específicas (ex: apenas 'admin').
 */
export async function requireAdminRole(
  event: H3Event,
  allowedRoles: string[] = ['admin'],
): Promise<AuthorizedAdmin> {
  const admin = await requireAdmin(event)

  if (!allowedRoles.includes(admin.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Acesso não autorizado: Esta ação é restrita a administradores.',
    })
  }

  return admin
}
