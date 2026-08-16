import fs from 'node:fs'
import path from 'node:path'
import { getR2Client, getR2BucketName, checkR2ObjectHead } from '../utils/r2Client'
import { PutObjectCommand } from '@aws-sdk/client-s3'

// Carregar .env se executado via CLI
function loadEnvIfPresent() {
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
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}
loadEnvIfPresent()

interface LocalAsset {
  localPath: string
  storageKey: string
  mimeType: string
}

const ASSETS_TO_SEED: LocalAsset[] = [
  { localPath: 'public/images/services/manutencao-portoes.webp', storageKey: 'services/manutencao-portoes.webp', mimeType: 'image/webp' },
  { localPath: 'public/images/services/recuperacao-gradis.webp', storageKey: 'services/recuperacao-gradis.webp', mimeType: 'image/webp' },
  { localPath: 'public/images/services/kit-corrente-portao.webp', storageKey: 'services/kit-corrente-portao.webp', mimeType: 'image/webp' },
  { localPath: 'public/images/services/troca-trilhos.webp', storageKey: 'services/troca-trilhos.webp', mimeType: 'image/webp' },
  { localPath: 'public/images/services/serralheria-geral.webp', storageKey: 'services/serralheria-geral.webp', mimeType: 'image/webp' },
  { localPath: 'public/images/services/portas-corta-fogo.webp', storageKey: 'services/portas-corta-fogo.webp', mimeType: 'image/webp' },
  { localPath: 'public/images/services/roldanas-duplas-truck.webp', storageKey: 'services/roldanas-duplas-truck.webp', mimeType: 'image/webp' },
  { localPath: 'public/videos/antes.mp4', storageKey: 'videos/antes.mp4', mimeType: 'video/mp4' },
  { localPath: 'public/videos/resultado final.mp4', storageKey: 'videos/resultado-final.mp4', mimeType: 'video/mp4' },
]

export async function runR2AssetSeed() {
  console.log('--- [Seed R2] Iniciando validação e upload dos 9 arquivos locais ---')
  const client = getR2Client()
  const bucket = getR2BucketName()

  let uploadedCount = 0
  let existingCount = 0

  for (const asset of ASSETS_TO_SEED) {
    const fullPath = path.resolve(process.cwd(), asset.localPath)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Arquivo local não encontrado: ${asset.localPath}`)
    }

    const stats = fs.statSync(fullPath)
    console.log(`[Seed R2] Checando ${asset.storageKey} (${stats.size} bytes)...`)

    let exists = false
    try {
      await checkR2ObjectHead(asset.storageKey)
      exists = true
      existingCount++
      console.log(`[Seed R2] ✓ Já existe no R2: ${asset.storageKey}`)
    } catch {
      exists = false
    }

    if (!exists) {
      console.log(`[Seed R2] ➔ Enviando ${asset.storageKey} ao bucket ${bucket}...`)
      const fileBuffer = fs.readFileSync(fullPath)
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: asset.storageKey,
        ContentType: asset.mimeType,
        Body: fileBuffer,
        ContentLength: stats.size,
      }))
      uploadedCount++
      console.log(`[Seed R2] ✓ Upload concluído: ${asset.storageKey}`)
    }
  }

  console.log(`--- [Seed R2] Concluído: ${uploadedCount} enviados, ${existingCount} já existiam. ---`)
  return { uploadedCount, existingCount, total: ASSETS_TO_SEED.length }
}

if (process.argv[1] && process.argv[1].includes('seedR2AndDb')) {
  runR2AssetSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed R2] Falha:', err)
      process.exit(1)
    })
}
