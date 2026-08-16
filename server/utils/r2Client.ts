import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function raiseR2Error(publicMessage: string, statusCode = 500) {
  if (typeof (globalThis as any).createError === 'function') {
    return (globalThis as any).createError({ statusCode, statusMessage: publicMessage })
  }
  return new Error(publicMessage)
}

function getR2Credentials() {
  let accountId = process.env.R2_ACCOUNT_ID || ''
  let accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
  let secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
  let bucketName = process.env.R2_BUCKET_NAME || ''
  let publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || ''

  try {
    if (typeof (globalThis as any).useRuntimeConfig === 'function') {
      const config = (globalThis as any).useRuntimeConfig()
      if (config) {
        accountId = (config.r2AccountId as string) || accountId
        accessKeyId = (config.r2AccessKeyId as string) || accessKeyId
        secretAccessKey = (config.r2SecretAccessKey as string) || secretAccessKey
        bucketName = (config.r2BucketName as string) || bucketName
        publicBaseUrl = (config.r2PublicBaseUrl as string) || publicBaseUrl
      }
    }
  } catch {
    // Fora do ciclo do Nuxt
  }

  // Validação fail-closed
  const missingVars: string[] = []
  if (!accountId) missingVars.push('R2_ACCOUNT_ID')
  if (!accessKeyId) missingVars.push('R2_ACCESS_KEY_ID')
  if (!secretAccessKey) missingVars.push('R2_SECRET_ACCESS_KEY')
  if (!bucketName) missingVars.push('R2_BUCKET_NAME')
  if (!publicBaseUrl) missingVars.push('R2_PUBLIC_BASE_URL')

  if (missingVars.length > 0) {
    console.error(`[R2Client] Configuração de storage incompleta. Variáveis ausentes: [${missingVars.join(', ')}]`)
    throw raiseR2Error('Erro de configuração no serviço de armazenamento.', 500)
  }

  // Normalização e validação de HTTPS da URL pública
  const cleanBase = publicBaseUrl.trim().replace(/\/+$/, '')
  if (!cleanBase.startsWith('https://')) {
    console.error('[R2Client] R2_PUBLIC_BASE_URL deve utilizar obrigatoriamente o protocolo HTTPS.')
    throw raiseR2Error('Erro de configuração no serviço de armazenamento.', 500)
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl: cleanBase }
}

export function getR2Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = getR2Credentials()

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
}

export function getR2BucketName(): string {
  const { bucketName } = getR2Credentials()
  return bucketName
}

export function getR2PublicUrl(storageKey: string | null | undefined): string {
  if (!storageKey) return ''
  const trimmed = storageKey.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  if (trimmed.startsWith('/images/')) {
    return trimmed
  }
  if (trimmed.startsWith('images/')) {
    return `/${trimmed}`
  }
  if (trimmed.startsWith('public/images/')) {
    return `/${trimmed.replace(/^public\//, '')}`
  }
  const { publicBaseUrl } = getR2Credentials()
  const cleanKey = trimmed.replace(/^\/+/, '')
  return `${publicBaseUrl}/${cleanKey}`
}

export async function generatePresignedPutUrl(params: {
  storageKey: string
  mimeType: string
  maxSizeBytes: number
  expiresInSeconds?: number
}): Promise<string> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.storageKey,
    ContentType: params.mimeType,
  })

  return await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds || 300,
  })
}

export async function checkR2ObjectHead(storageKey: string) {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: storageKey,
  })

  return await client.send(command)
}

export async function getR2ObjectRange(storageKey: string, range: string) {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    Range: range,
  })

  return await client.send(command)
}

export async function deleteR2Object(storageKey: string) {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: storageKey,
  })

  return await client.send(command)
}
