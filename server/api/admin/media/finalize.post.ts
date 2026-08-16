import { requireAdmin } from '../../../utils/requireAdmin'
import { mediaFinalizeSchema } from '../../../validators/publicationSchemas'
import { finalizePublicationMedia } from '../../../services/media/mediaAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = mediaFinalizeSchema.parse(body)

  const media = await finalizePublicationMedia({
    userId: user.id,
    intentId: validated.intent_id,
    altText: validated.alt_text,
    caption: validated.caption,
    mediaStage: validated.media_stage,
    isCover: validated.is_cover,
    width: validated.width,
    height: validated.height,
    durationSeconds: validated.duration_seconds,
  })

  return {
    success: true,
    media,
  }
})
