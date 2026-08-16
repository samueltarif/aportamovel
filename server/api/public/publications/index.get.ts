import { getPublicPublicationsList } from '../../../services/publications/publicationPublicService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  const query = getQuery(event)
  const serviceSlug = query.service_slug ? String(query.service_slug) : undefined
  const page = query.page ? parseInt(String(query.page), 10) : 1
  const limit = query.limit ? parseInt(String(query.limit), 10) : 6

  return await getPublicPublicationsList({ serviceSlug, page, limit })
})
