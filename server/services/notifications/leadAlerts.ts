import { buildAlertHtml, sendAlert, type AlertField } from '~~/server/services/notifications/alertMailer'
import { parseLeadTracking } from '~~/shared/utils/leadTracking'

const SITE = 'https://aportamovel.com.br'

/** Plano grátis do Resend: 100 e-mails/dia contando cada destinatário. Limite de avisos de clique por dia. */
export const MAX_CLICK_ALERTS_PER_DAY = 20

function origin(t: { gclid?: string | null, gbraid?: string | null, wbraid?: string | null, kw?: string | null, utm_source?: string | null, utm_campaign?: string | null, referrer_host?: string | null }): string {
  if (t.gclid || t.gbraid || t.wbraid) return t.kw ? `Anúncio Google Ads · "${t.kw}"` : 'Anúncio Google Ads'
  if (t.utm_source) return [t.utm_source, t.utm_campaign].filter(Boolean).join(' · ')
  if (t.referrer_host) return /google\./.test(t.referrer_host) ? 'Busca do Google' : t.referrer_host
  return 'Acesso direto / não identificado'
}

const nowBR = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export interface LeadAlertInput {
  full_name: string
  phone: string
  email?: string | null
  company_or_condominium?: string | null
  service_name?: string | null
  message?: string | null
  form_id: string
  source_path: string
  utm_source?: string | null
  utm_campaign?: string | null
}

/** Aviso de pedido de orçamento (formulário de contato, modal de orçamento ou pop-up da LP). */
export async function sendLeadAlert(lead: LeadAlertInput): Promise<void> {
  const { tracking, text } = parseLeadTracking(lead.message)
  const isPopup = tracking.canal === 'whatsapp_popup'
  const kind = isPopup ? 'Número deixado no pop-up do WhatsApp' : lead.form_id === 'contact_form' ? 'Formulário de contato' : 'Pedido de orçamento'
  const fields: AlertField[] = [
    { label: 'Quando', value: nowBR() },
    { label: 'Tipo', value: kind },
    { label: 'Nome', value: isPopup ? null : lead.full_name },
    { label: 'Telefone', value: lead.phone },
    { label: 'E-mail', value: lead.email },
    { label: 'Condomínio/empresa', value: lead.company_or_condominium },
    { label: 'Serviço', value: lead.service_name },
    { label: 'Mensagem', value: text || null },
    { label: 'Página', value: lead.source_path },
    { label: 'Origem', value: origin({ ...tracking, utm_source: lead.utm_source, utm_campaign: lead.utm_campaign }) },
    { label: 'Código WhatsApp', value: tracking.wa },
  ]
  const who = isPopup ? lead.phone : `${lead.full_name} · ${lead.phone}`
  const subject = `Novo pedido no site: ${who}${lead.company_or_condominium ? ` · ${lead.company_or_condominium}` : ''}`
  const html = buildAlertHtml('Novo pedido de orçamento', fields, `${SITE}/gestao/leads`, 'Abrir no painel')
  const plain = fields.filter(f => f.value).map(f => `${f.label}: ${f.value}`).join('\n')
  await sendAlert(subject, html, plain)
}

export interface ClickAlertInput {
  code: string
  channel: 'commercial' | 'emergency'
  cta_location: string
  page_path: string
  service_slug?: string | null
  device: string
  city?: string | null
  gclid?: string | null
  gbraid?: string | null
  wbraid?: string | null
  utm_term?: string | null
  utm_source?: string | null
  utm_campaign?: string | null
  referrer_host?: string | null
}

const DEVICE: Record<string, string> = { mobile: 'Celular', tablet: 'Tablet', desktop: 'Computador' }

/** Aviso de clique no WhatsApp, com o código que chega no fim da mensagem. */
export async function sendClickAlert(click: ClickAlertInput): Promise<void> {
  const fields: AlertField[] = [
    { label: 'Código', value: click.code },
    { label: 'Quando', value: nowBR() },
    { label: 'WhatsApp', value: click.channel === 'emergency' ? 'Plantão de emergência' : 'Comercial' },
    { label: 'Botão', value: click.cta_location.replace(/_/g, ' ') },
    { label: 'Página', value: click.page_path },
    { label: 'Serviço', value: click.service_slug },
    { label: 'Origem', value: origin({ ...click, kw: click.utm_term }) },
    { label: 'Aparelho', value: [DEVICE[click.device], click.city].filter(Boolean).join(' · ') || null },
  ]
  const subject = `Clique no WhatsApp ${click.code}${click.gclid || click.gbraid || click.wbraid ? ' · anúncio' : ''}${click.channel === 'emergency' ? ' · PLANTÃO' : ''}`
  const html = buildAlertHtml(`Alguém clicou no WhatsApp (${click.code})`, [
    ...fields,
    { label: 'O que fazer', value: 'Quando a mensagem com esse código chegar, identifique a pessoa no painel.' },
  ], `${SITE}/gestao/whatsapp`, 'Identificar no painel')
  const plain = fields.filter(f => f.value).map(f => `${f.label}: ${f.value}`).join('\n')
  await sendAlert(subject, html, plain)
}
