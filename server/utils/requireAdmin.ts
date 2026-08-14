import type { H3Event } from 'h3'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { getAdminUser, type AdminUser } from '../services/adminService'

export interface AuthorizedAdmin {
  userId: string
  email: string
  role: string
}

/**
 * Guard server-side reutilizável para endpoints administrativos.
 *
 * Fluxo:
 * 1. Valida a sessão via cookie → 401 se ausente
 * 2. Cria o cliente autenticado com a sessão do usuário
 * 3. Consulta admin_users com RLS → 403 se não existir
 * 4. Verifica is_active → 403 se inativo
 * 5. Retorna dados mínimos do admin autorizado
 *
 * Nunca aceita dados de autorização do frontend.
 */
export async function requireAdmin(event: H3Event): Promise<AuthorizedAdmin> {
  // 1. Validar sessão no servidor
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Não autenticado.',
    })
  }

  // 2. Criar cliente com contexto da sessão autenticada
  const client = await serverSupabaseClient(event)

  // 3. Consultar registro administrativo (RLS ativa)
  const adminUser: AdminUser | null = await getAdminUser(client, user.id)

  if (!adminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Você não possui autorização para acessar este painel.',
    })
  }

  // 4. Verificar se o administrador está ativo
  if (!adminUser.is_active) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Você não possui autorização para acessar este painel.',
    })
  }

  // 5. Retornar somente dados mínimos — sem tokens, sem segredos
  return {
    userId: user.id,
    email: user.email ?? '',
    role: adminUser.role,
  }
}
