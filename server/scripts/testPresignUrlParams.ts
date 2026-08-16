import fs from 'node:fs'
import path from 'node:path'
import { generatePresignedPutUrl } from '../utils/r2Client'

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

async function testPresignedParams() {
  const url = await generatePresignedPutUrl({
    storageKey: 'test/verify-checksum-removal.mp4',
    mimeType: 'video/mp4',
    maxSizeBytes: 10485760,
    expiresInSeconds: 300,
  })

  const hasCrc32 = url.includes('x-amz-checksum-crc32')
  const hasAlgorithm = url.includes('x-amz-sdk-checksum-algorithm')

  console.log('--- TESTE DE ASSINATURA DE URL PRÉ-ASSINADA ---')
  console.log(`Parametro x-amz-checksum-crc32 ausente: ${!hasCrc32 ? '✓ SIM (Correto)' : '✗ NÃO (Falha)'}`)
  console.log(`Parametro x-amz-sdk-checksum-algorithm ausente: ${!hasAlgorithm ? '✓ SIM (Correto)' : '✗ NÃO (Falha)'}`)

  if (hasCrc32 || hasAlgorithm) {
    console.error('ERRO: Parâmetros de checksum flexível ainda foram detectados na URL.')
    process.exit(1)
  }

  console.log('SUCESSO: A URL pré-assinada está limpa e 100% pronta para upload direto via fetch no navegador.')
}

testPresignedParams().catch((err) => {
  console.error('Erro:', err.message)
  process.exit(1)
})
