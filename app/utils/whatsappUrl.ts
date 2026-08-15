export const COMMERCIAL_WHATSAPP_PHONE = '5511912984416'

export interface WhatsAppMessageOptions {
  name: string
  phone: string
  companyOrCondominium?: string | null
  email?: string | null
  message?: string | null
  serviceName?: string | null
}

/**
 * Constrói a URL do WhatsApp Comercial codificada em UTF-8 estrito
 * sem caracteres U+FFFD () e com quebras de linha reais (\n).
 */
export function buildCommercialWhatsAppUrl(options: WhatsAppMessageOptions): string {
  const sanitizedPhone = COMMERCIAL_WHATSAPP_PHONE.replace(/\D/g, '')

  const lines: string[] = [
    '*Solicitação de Orçamento via Site — A Portamóvel*',
    '',
    `*Nome:* ${options.name.trim()}`,
    `*Condomínio / Empresa:* ${options.companyOrCondominium?.trim() || 'Não informado'}`,
  ]

  if (options.serviceName) {
    lines.push(`*Serviço:* ${options.serviceName.trim()}`)
  }

  if (options.email) {
    lines.push(`*E-mail:* ${options.email.trim()}`)
  }

  lines.push(`*Telefone / WhatsApp:* ${options.phone.trim()}`)

  if (options.message && options.message.trim()) {
    lines.push(`*Mensagem / Escopo técnico:* ${options.message.trim()}`)
  }
  else if (!options.serviceName) {
    lines.push('*Mensagem / Escopo técnico:* Não informado')
  }

  const whatsappMessage = lines.join('\n')
  return `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodeURIComponent(whatsappMessage)}`
}
