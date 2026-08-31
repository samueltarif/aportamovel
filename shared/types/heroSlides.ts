export interface PublicHeroSlide {
  id: string
  imageUrl: string
  altText: string
  title: string
  sortOrder: number
}

export interface AdminHeroSlideItem {
  id: string
  media_id: string
  sort_order: number
  is_active: boolean
  title_override?: string | null
  service_name: string
  service_slug: string
  publication_title: string
  publication_slug: string
  effective_title: string
  image_url: string
  thumbnail_url?: string | null
  alt_text: string
  created_at: string
  updated_at: string
}

export interface AvailableHeroMedia {
  id: string
  publication_id: string
  publication_title: string
  publication_slug: string
  service_id: string
  service_name: string
  service_slug: string
  storage_key: string
  image_url: string
  thumbnail_url?: string | null
  alt_text: string
  is_cover: boolean
  is_already_added: boolean
}

export interface HeroSlideCreateInput {
  media_id: string
  title_override?: string | null
}

export interface HeroSlideUpdateInput {
  is_active?: boolean
  title_override?: string | null
}

export interface PaginatedAvailableMediaResponse {
  items: AvailableHeroMedia[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
