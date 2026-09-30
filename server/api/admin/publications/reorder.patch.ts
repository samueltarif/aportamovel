import { z } from 'zod'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getPrivateSupabaseClient } from '../../../utils/supabasePrivate'

const schema = z.object({ publication_ids: z.array(z.string().uuid()).min(1) })
  .strict().refine(body => new Set(body.publication_ids).size === body.publication_ids.length, 'Lista contém IDs repetidos.')

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  const user = await requireAdmin(event)
  const body = schema.parse(await readBody(event))
  const { data, error } = await getPrivateSupabaseClient().rpc('reorder_home_publications_atomic' as any, {
    p_user_id: user.id, p_publication_ids: body.publication_ids,
  } as any)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message || 'Não foi possível salvar a ordem.' })
  return data
})
