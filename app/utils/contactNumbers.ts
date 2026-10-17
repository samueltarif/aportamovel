/**
 * Canais de contato por turno — espelha o EmergencyModal do site.
 *  - 07:00 às 16:00  → atendimento comercial (fixo 3991-0280 + WhatsApp comercial)
 *  - 16:00 às 07:00  → plantão de emergência (celular/WhatsApp de plantão)
 * O horário é sempre o de Brasília (America/Sao_Paulo), independente do aparelho do visitante.
 */
export type Shift = 'day' | 'plantao'

export const DAY_START_HOUR = 7
export const DAY_END_HOUR = 16

export interface ContactChannel {
  shift: Shift
  statusLabel: string
  phoneDisplay: string
  phoneTel: string
  phoneType: 'fixed_secondary' | 'emergency'
  whatsappDisplay: string
  whatsappNumber: string
  whatsappChannel: 'commercial' | 'emergency'
  whatsappText: string
}

export const CONTACT: Record<Shift, ContactChannel> = {
  day: {
    shift: 'day',
    statusLabel: 'Atendimento comercial até as 16h',
    phoneDisplay: '(11) 3991-0280',
    phoneTel: '1139910280',
    phoneType: 'fixed_secondary',
    whatsappDisplay: '(11) 91298-4416',
    whatsappNumber: '5511912984416',
    whatsappChannel: 'commercial',
    whatsappText: 'Olá! Preciso de um técnico para o portão do condomínio.\nCondomínio:\nBairro:\nSou (síndico/zelador/administradora):\nO que aconteceu:',
  },
  plantao: {
    shift: 'plantao',
    statusLabel: 'Plantão de emergência ativo agora',
    phoneDisplay: '(11) 94027-7438',
    phoneTel: '11940277438',
    phoneType: 'emergency',
    whatsappDisplay: '(11) 94027-7438',
    whatsappNumber: '5511940277438',
    whatsappChannel: 'emergency',
    whatsappText: 'EMERGÊNCIA: portão do condomínio com problema.\nCondomínio:\nBairro:\nSou (síndico/zelador/administradora):\nO que aconteceu:',
  },
}

/** Retorna o turno atual no fuso de Brasília. */
export function getShift(date: Date = new Date()): Shift {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone: 'America/Sao_Paulo',
    }).format(date),
  )
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? 'day' : 'plantao'
}

export function buildWhatsAppLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
