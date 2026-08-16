import { getPublicServicesList } from '../../../services/services/servicePublicService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  const query = getQuery(event)
  const onlyFeatured = query.featured === 'true'
  return await getPublicServicesList({ onlyFeatured })
})
