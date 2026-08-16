import { requireAdmin } from '../../../../utils/requireAdmin'
import { serviceCardFinalizeSchema } from '../../../../validators/serviceSchemas'
import { finalizeServiceCardImage } from '../../../../services/services/serviceCardUploadService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = serviceCardFinalizeSchema.parse(body)

  return await finalizeServiceCardImage({
    userId: user.id,
    intentId: validated.intent_id,
    altText: validated.alt_text,
  })
})
