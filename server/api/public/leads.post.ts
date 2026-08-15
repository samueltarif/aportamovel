import { publicLeadSubmissionSchema } from '~~/server/validators/leadSchemas'
import { createPublicLead } from '~~/server/services/leads/leadService'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Requisição inválida.',
    })
  }

  // Honeypot invisível para bots: se preenchido, descarta silenciosamente
  if (body._hp_company_title && String(body._hp_company_title).length > 0) {
    return { success: true }
  }

  const parseResult = publicLeadSubmissionSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Dados do formulário inválidos. Verifique os campos preenchidos.',
    })
  }

  return await createPublicLead(parseResult.data)
})
