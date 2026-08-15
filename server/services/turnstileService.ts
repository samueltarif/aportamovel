interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

export async function verifyTurnstileToken(options: {
  token: string
  expectedAction: string
  idempotencyKey: string
}): Promise<boolean> {
  const config = useRuntimeConfig()
  const secretKey = (config.turnstileSecretKey || process.env.TURNSTILE_SECRET_KEY || '') as string

  if (!secretKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'O serviço de proteção anti-spam não está configurado no servidor.',
    })
  }

  const allowedHostnames = (config.turnstileAllowedHostnames || '')
    .split(',')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean)

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', options.token)
    formData.append('idempotency_key', options.idempotencyKey)

    const response = await $fetch<TurnstileVerifyResponse>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      timeout: 6000,
    })

    if (!response || !response.success) {
      return false
    }

    // Validar hostname autorizado
    if (response.hostname) {
      const respHost = response.hostname.toLowerCase()
      const isAllowedHost = allowedHostnames.length === 0 || allowedHostnames.some(h => respHost === h || respHost.endsWith(`.${h}`))
      if (!isAllowedHost) {
        return false
      }
    }

    // Validar action esperada se retornada pelo Turnstile
    if (response.action && response.action !== options.expectedAction) {
      return false
    }

    return true
  }
  catch (err: any) {
    if (err.statusCode === 503) throw err
    return false
  }
}
