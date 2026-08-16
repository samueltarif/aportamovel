import fs from 'node:fs'
import path from 'node:path'
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'

// Carregar .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) process.env[key] = val
      }
    }
  }
}
loadEnv()

async function setupCors() {
  const accountId = process.env.R2_ACCOUNT_ID || ''
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
  const bucketName = process.env.R2_BUCKET_NAME || ''

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error('[R2 CORS] Variáveis R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY ou R2_BUCKET_NAME ausentes.')
    process.exit(1)
  }

  console.log(`[R2 CORS] Configurando CORS no bucket: ${bucketName}...`)

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  const corsRules = [
    {
      AllowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:*',
        'https://*.vercel.app',
        'https://www.aportamovel.com.br',
        'https://aportamovel.com.br',
        '*', // Permite requisições de upload diretas do navegador
      ],
      AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag', 'Content-Type', 'Content-Length', 'x-amz-request-id'],
      MaxAgeSeconds: 3600,
    },
  ]

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: corsRules,
      },
    })
  )

  console.log(`[R2 CORS] ✓ CORS configurado com sucesso no bucket '${bucketName}'!`)

  const currentCors = await client.send(
    new GetBucketCorsCommand({
      Bucket: bucketName,
    })
  )

  console.log('[R2 CORS] Regras ativas:', JSON.stringify(currentCors.CORSRules, null, 2))
}

setupCors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[R2 CORS] Erro:', err)
    process.exit(1)
  })
