import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export interface AdminUser {
  user_id: string
  role: string
  is_active: boolean
  accepted_at: string | null
}

/**
 * Consulta o registro administrativo do usuário informado.
 * Usa o cliente autenticado — a RLS garante que somente o próprio
 * usuário lê seu registro (política admin_users_select_own).
 *
 * @returns AdminUser | null
 */
export async function getAdminUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<AdminUser | null> {
  const { data, error } = await client
    .from('admin_users')
    .select('user_id, role, is_active, accepted_at')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[getAdminUser] Supabase Query Error:', error)
  }
  if (error || !data) {
    return null
  }

  return data as AdminUser
}
