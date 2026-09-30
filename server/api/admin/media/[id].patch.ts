import { z } from 'zod'
import { requireAdmin } from '../../../utils/requireAdmin'
import { mediaUpdateSchema } from '../../../validators/publicationSchemas'
import { getPrivateSupabaseClient } from '../../../utils/supabasePrivate'
import { getR2PublicUrl } from '../../../utils/r2Client'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  const user = await requireAdmin(event)
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const body = mediaUpdateSchema.parse(await readBody(event))
  const { data, error } = await getPrivateSupabaseClient().rpc('update_media_details_atomic' as any, {
    p_media_id: id, p_user_id: user.id, p_alt_text: body.alt_text,
    p_caption: body.caption, p_media_stage: body.media_stage,
  } as any)
  if (error || !data) throw createError({ statusCode: 400, statusMessage: error?.message || 'Não foi possível editar a mídia.' })
  const media = data as any
  return { media: { ...media, url: getR2PublicUrl(media.storage_key), thumbnail_url: media.thumbnail_storage_key ? getR2PublicUrl(media.thumbnail_storage_key) : null } }
})
