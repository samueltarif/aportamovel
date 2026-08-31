export type CtaLocation =
  | 'header'
  | 'topbar'
  | 'floating_button'
  | 'home_hero'
  | 'service_card'
  | 'service_modal'
  | 'maintenance_contract'
  | 'contact_page'
  | 'contact_form'
  | 'quote_modal'
  | 'emergency_modal'
  | 'footer'

export type ChannelType = 'commercial' | 'emergency'

export type PhoneType = 'fixed_primary' | 'fixed_secondary' | 'commercial' | 'emergency'

export type InteractionType = 'modal_open' | 'details_open'

export type SubmissionDestination = 'whatsapp' | 'internal_form'

export type FormId = 'contact_form' | 'quote_modal'

export type FormLocation = 'contact_page' | 'quote_modal'

export interface WhatsAppClickProps {
  page_path: string
  cta_location: CtaLocation
  channel_type: ChannelType
  service_slug?: string
}

export interface PhoneClickProps {
  page_path: string
  cta_location: CtaLocation
  phone_type: PhoneType
}

export interface ServiceViewProps {
  page_path: string
  service_slug: string
  service_name: string
  interaction_type: InteractionType
}

export interface QuoteFormStartedProps {
  page_path: string
  form_id: FormId
  form_location: FormLocation
}

export interface QuoteFormSubmittedProps {
  page_path: string
  form_id: FormId
  form_location: FormLocation
  submission_destination: SubmissionDestination
  service_slug?: string
}

export const BLOCKED_PII_KEYS = [
  'name',
  'nome',
  'email',
  'e-mail',
  'phone',
  'telefone',
  'whatsapp_number',
  'message',
  'mensagem',
  'description',
  'descricao',
  'condominio',
  'condo',
  'cnpj',
  'cpf',
  'password',
  'senha',
  'file',
  'arquivo',
  'photo',
  'foto',
  'attachment',
  'anexo',
] as const
