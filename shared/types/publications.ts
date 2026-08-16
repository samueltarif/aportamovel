export type PublicationStatus = 'draft' | 'published' | 'archived'
export type MediaType = 'image' | 'video'
export type MediaStage = 'before' | 'after' | 'general'

export interface ServicePublication {
  id: string
  service_id: string
  title: string
  slug: string
  summary: string
  description: string
  status: PublicationStatus
  display_order: number
  published_at?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at: string
  updated_at: string
}

export interface ServiceMedia {
  id: string
  publication_id: string
  storage_key: string
  media_type: MediaType
  media_stage: MediaStage
  mime_type: string
  size_bytes: number
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
  thumbnail_storage_key?: string | null
  url?: string
  thumbnail_url?: string | null
  alt_text: string
  caption?: string | null
  sort_order: number
  is_cover: boolean
  created_at: string
}

export interface PublicMediaItem {
  id: string
  media_type: MediaType
  media_stage: MediaStage
  mime_type?: string
  url: string
  thumbnail_url: string
  alt_text: string
  caption?: string | null
  sort_order: number
  is_cover: boolean
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
}

export interface PublicPublicationCard {
  id: string
  service_id: string
  service_slug: string
  service_name: string
  title: string
  slug: string
  summary: string
  published_at: string
  cover_url: string
  cover_alt: string
  media_count: number
  has_video: boolean
  has_before_after: boolean
}

export interface PublicPublicationDetail {
  id: string
  service_id: string
  service_slug: string
  service_name: string
  title: string
  slug: string
  summary: string
  description: string
  published_at: string
  medias: PublicMediaItem[]
}

export interface AdminPublicationDetail extends ServicePublication {
  service_name: string
  service_slug: string
  medias: ServiceMedia[]
}

export interface PaginatedPublicationsResponse {
  items: PublicPublicationCard[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
  }
}
