import { createClient } from '@supabase/supabase-js'
import type { Database } from '~~/app/types/database.types'

let _supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdminClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = (process.env.NUXT_PUBLIC_SUPABASE_URL || config.public?.supabase?.url || '') as string
  const supabaseSecretKey = (config.supabaseSecretKey || process.env.SUPABASE_SECRET_KEY || '') as string

  if (!supabaseUrl || !supabaseSecretKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Configuração do banco de dados ausente no servidor.',
    })
  }

  if (!_supabaseAdminClient) {
    _supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  return _supabaseAdminClient
}
