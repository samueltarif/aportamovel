import { requireAdmin } from '~/../server/utils/requireAdmin'
import { analyticsQuerySchema } from '~/../server/validators/analyticsSchemas'
import { getDashboardAnalytics } from '~/../server/services/posthog/analyticsService'

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
      message: 'Parâmetro de período inválido. Use 7, 30 ou 90.',
    })
  }

  const { period } = parseResult.data

  // 3. Execução do serviço analítico server-side
  const dashboardData = await getDashboardAnalytics(period, event)

  return dashboardData
})
