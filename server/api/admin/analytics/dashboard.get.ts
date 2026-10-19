import { requireAdmin } from '~/../server/utils/requireAdmin'
import { analyticsQuerySchema } from '~/../server/validators/analyticsSchemas'
import { getDashboardAnalytics } from '~/../server/services/posthog/analyticsService'
import { resolveAnalyticsRange } from '~/../server/services/posthog/analyticsRange'

export default defineEventHandler(async (event) => {
  // 1. Guard obrigatório: somente administradores ativos autenticados
  await requireAdmin(event)

  // 2. Validação segura dos parâmetros de query (Zod)
  const rawQuery = getQuery(event)
  const parseResult = analyticsQuerySchema.safeParse(rawQuery)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parseResult.error.issues[0]?.message
        || 'Período inválido. Use today, 7, 30, 90 ou custom (com from/to).',
    })
  }

  // 3. Converte a seleção em intervalo de datas (fuso de São Paulo)
  const range = resolveAnalyticsRange(parseResult.data)

  // 4. Execução do serviço analítico server-side
  return await getDashboardAnalytics(range, event)
})
