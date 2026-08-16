import { createClient } from '@supabase/supabase-js'
import type { Database } from '~~/app/types/database.types'

let _supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdminClient() {
  let supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  let supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || ''

  try {
    if (typeof (globalThis as any).useRuntimeConfig === 'function') {
      const config = (globalThis as any).useRuntimeConfig()
      if (config) {
        supabaseUrl = (config.public?.supabase?.url || supabaseUrl) as string
        supabaseSecretKey = (config.supabaseSecretKey || supabaseSecretKey) as string
      }
    }
  } catch {
    // Fora do ciclo do Nuxt
  }

  if (!supabaseUrl || !supabaseSecretKey) {
    const raiseError = typeof (globalThis as any).createError === 'function'
      ? (globalThis as any).createError({
          statusCode: 503,
          statusMessage: 'Service Unavailable',
          message: 'Configuração do banco de dados ausente no servidor.',
        })
      : new Error('Configuração do banco de dados ausente no servidor.')
    throw raiseError
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

export const getPrivateSupabaseClient = getSupabaseAdminClient
