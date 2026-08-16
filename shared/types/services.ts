export type ServiceIconKey =
  | 'gate'
  | 'fence'
  | 'chain'
  | 'rail'
  | 'welding'
  | 'door'
  | 'roller'
  | 'cftv'
  | 'wrench'
  | 'shield'

export type ServiceAccentVariant = 'blue' | 'red'

export interface Service {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
  card_image_storage_key: string | null
  card_image_alt: string | null
  card_image_url?: string | null
  icon_key: ServiceIconKey
  accent_variant: ServiceAccentVariant
  is_active: boolean
  is_featured: boolean
  display_order: number
  home_display_order: number
  created_by?: string | null
  updated_by?: string | null
  archived_at?: string | null
  created_at: string
  updated_at: string
}

export interface PublicServiceItem {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
  card_image_url: string
  card_image_alt: string
  icon_key: ServiceIconKey
  accent_variant: ServiceAccentVariant
  display_order: number
  is_featured: boolean
  home_display_order: number
  publications_count: number
  has_publications: boolean
}

export interface ServiceCreateInput {
  name: string
  slug: string
  short_description: string
  description: string
  icon_key: ServiceIconKey
  accent_variant?: ServiceAccentVariant
  is_featured?: boolean
  display_order?: number
  home_display_order?: number
}

export interface ServiceUpdateInput {
  name?: string
  slug?: string
  short_description?: string
  description?: string
  icon_key?: ServiceIconKey
  accent_variant?: ServiceAccentVariant
  is_featured?: boolean
  display_order?: number
  home_display_order?: number
}
