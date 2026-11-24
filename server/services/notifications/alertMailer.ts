/**
 * Avisos por e-mail para a equipe comercial (pedido de orçamento e clique no WhatsApp), via Resend.
 *
 * Configuração (variáveis de ambiente na Vercel):
 *  - RESEND_API_KEY      chave do Resend (secreta)
 *  - LEAD_ALERT_EMAILS   destinatários separados por vírgula
 *  - ALERT_FROM          remetente (opcional; padrão "A Portamóvel <avisos@aportamovel.com.br>")
 *
 * Nunca lança erro nem atrasa o visitante além de alguns segundos: sem configuração, não envia.
 */
const RESEND_URL = 'https://api.resend.com/emails'
const TIMEOUT_MS = 4000

export interface AlertField {
  label: string
  value?: string | null
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function recipients(): string[] {
  return (process.env.LEAD_ALERT_EMAILS || '')
    .split(/[,;\s]+/)
    .map(e => e.trim().toLowerCase())
    .filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
}

/** Monta um e-mail simples: título, lista de campos e um botão para o painel. */
export function buildAlertHtml(title: string, fields: AlertField[], panelUrl: string, buttonLabel: string): string {
  const rows = fields
    .filter(f => f.value && String(f.value).trim())
    .map(f => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">${escapeHtml(f.label)}</td><td style="padding:6px 0;color:#0f172a;font-weight:600">${escapeHtml(String(f.value)).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#ffffff;border-radius:12px;padding:24px;border-top:4px solid #c8102e">
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">A Portamóvel · aviso do site</p>
    <h1 style="margin:0 0 16px;font-size:20px;color:#09357a">${escapeHtml(title)}</h1>
    <table style="border-collapse:collapse;font-size:14px">${rows}</table>
    <p style="margin:24px 0 0"><a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#09357a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;font-size:14px">${escapeHtml(buttonLabel)}</a></p>
  </div>
  <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:12px">Aviso automático do site aportamovel.com.br. Não responda este e-mail.</p>
</div></body></html>`
}

export async function sendAlert(subject: string, html: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = recipients()
  if (!apiKey || !to.length) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ALERT_FROM || 'A Portamóvel <avisos@aportamovel.com.br>',
        to,
        subject: subject.slice(0, 180),
        html,
        text,
      }),
      signal: controller.signal,
    })
    if (!res.ok) console.error('[alerta] Resend respondeu', res.status)
    return res.ok
  }
  catch {
    console.error('[alerta] falha ao enviar aviso')
    return false
  }
  finally {
    clearTimeout(timer)
  }
}
