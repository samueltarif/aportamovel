import type { H3Event } from 'h3'

export interface PostHogQueryResponse<T = any[]> {
  results: T[]
  columns: string[]
  types: string[]
}

export interface PostHogClientConfig {
  apiKey: string
  projectId: string
  apiHost: string
}

export function getPostHogConfig(event?: H3Event): PostHogClientConfig {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
  const apiKey = (config.posthogPersonalApiKey as string) || process.env.POSTHOG_PERSONAL_API_KEY || ''
  const projectId = (config.posthogProjectId as string) || process.env.POSTHOG_PROJECT_ID || '559598'
  const apiHost = (config.posthogApiHost as string) || process.env.POSTHOG_API_HOST || 'https://us.posthog.com'

  return { apiKey, projectId, apiHost }
}

/**
 * Executa uma consulta HogQL contra a PostHog Query API no servidor.
 *
 * @param query Consulta SQL / HogQL formatada
 * @param queryName Nome descritivo para auditoria no PostHog
 * @param event Contexto H3Event para leitura do runtimeConfig
 */
export async function executeHogQLQuery<T = any[]>(
  query: string,
  queryName: string,
  event?: H3Event,
): Promise<PostHogQueryResponse<T>> {
  const { apiKey, projectId, apiHost } = getPostHogConfig(event)

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'A integração analítica não está configurada no servidor.',
    })
  }

  const endpoint = `${apiHost.replace(/\/$/, '')}/api/projects/${projectId}/query/`

  try {
    const response = await $fetch<PostHogQueryResponse<T>>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        query: {
          kind: 'HogQLQuery',
          query,
        },
        name: queryName,
      },
      timeout: 8000,
      retry: 1,
    })

    return response
  }
  catch (error: any) {
    // Nunca expor a chave ou detalhes internos nos logs
    console.error(`[PostHogClient] Erro na consulta '${queryName}':`, error?.statusCode || error?.message)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Falha na comunicação com o serviço de analytics.',
    })
  }
}
