import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/requireAdmin'
import { listCampaignLeads } from '~~/server/services/leads/leadAdminService'

const querySchema = z.object({
  period: z.enum(['7', '30', '90', 'all']).default('30'),
})

/** Leads da landing page de campanha (/lp/...) para a área "Campanha Google Ads" do painel. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Parâmetros de consulta inválidos.' })
  }
  return await listCampaignLeads(parsed.data.period)
})
