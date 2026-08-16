import type { H3Event } from 'h3'
import { getHeader, createError } from 'h3'

/**
 * Middleware / Guard para proteção Same-Origin estrita contra CSRF em requisições de mutação.
 * Exige obrigatoriamente o header Origin nas requisições POST, PATCH, PUT, DELETE.
 * Não faz fallback para Referer. Sem wildcards.
 */
export function requireSameOrigin(event: H3Event): void {
  const method = event.method.toUpperCase()

  // Somente valida métodos de mutação
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    return
  }

  const originHeader = getHeader(event, 'origin')
  if (!originHeader) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Requisição inválida: Header Origin obrigatório ausente.',
    })
  }

  const normalizedOrigin = originHeader.trim().replace(/\/+$/, '')

  let allowedOriginsList: string[] = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://www.aportamovel.com.br',
    'https://aportamovel.com.br',
  ]

  try {
    const config = useRuntimeConfig()
    if (config.allowedOrigins && typeof config.allowedOrigins === 'string') {
      allowedOriginsList = config.allowedOrigins
        .split(',')
        .map(o => o.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    }
  }
  catch {
    // Fora do ciclo normal do Nuxt / fallback
  }

  if (!allowedOriginsList.includes(normalizedOrigin)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Acesso não autorizado: Origem não permitida.',
    })
  }
}
