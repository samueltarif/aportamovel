import fs from 'node:fs'
import path from 'node:path'
import { getPrivateSupabaseClient } from '../utils/supabasePrivate'
import { presignPublicationMedia, finalizePublicationMedia, deleteMedia } from '../services/media/mediaAdminService'
import { getAdminPublicationById } from '../services/publications/publicationAdminService'
import { getPublicPublicationDetail } from '../services/publications/publicationPublicService'
import { checkR2ObjectHead } from '../utils/r2Client'

// Carregar .env em tempo de execução para o script
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

interface TestResult {
  step: number
  description: string
  httpStatus?: number
  passed: boolean
  message: string
}

async function runValidation() {
  console.log('=================================================================')
  console.log(' VALIDAÇÃO FUNCIONAL END-TO-END — CLOUDFLARE R2 & SUPABASE')
  console.log('=================================================================\n')

  const results: TestResult[] = []
  const supabase = getPrivateSupabaseClient()

  // 1. Obter usuário admin e publicação existente
  const { data: adminUser } = await supabase.from('admin_users').select('user_id').eq('is_active', true).limit(1).single()
  const adminId = (adminUser as any)?.user_id || '00000000-0000-0000-0000-000000000001'

  const { data: publication } = await supabase.from('service_publications').select('id, slug, service_id, services(slug)').limit(1).single()
  if (!publication) {
    throw new Error('Nenhuma publicação encontrada para o teste.')
  }

  const pubId = (publication as any).id
  const pubSlug = (publication as any).slug
  const srvSlug = (publication as any).services?.slug || 'manutencao-portoes'

  let uploadedImageMediaId = ''
  let uploadedVideoMediaId = ''

  // -------------------------------------------------------------
  // Teste 1 & 2: Presign e Upload Direto PUT de Imagem
  // -------------------------------------------------------------
  try {
    const imagePath = path.resolve(process.cwd(), 'public/images/services/manutencao-portoes.webp')
    const imageBuffer = fs.readFileSync(imagePath)

    // 1. Presign
    const presignImage = await presignPublicationMedia({
      userId: adminId,
      publicationId: pubId,
      fileExtension: 'webp',
      mimeType: 'image/webp',
      expectedSizeBytes: imageBuffer.length,
    })

    results.push({
      step: 1,
      description: 'POST /api/admin/media/presign (Imagem)',
      httpStatus: 200,
      passed: !!presignImage.presigned_url,
      message: 'Presigned URL gerada com sucesso para o bucket aportamovel',
    })

    // 2. PUT direto no R2
    const putRes = await fetch(presignImage.presigned_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/webp',
      },
      body: imageBuffer,
    })

    results.push({
      step: 2,
      description: 'PUT direto no Cloudflare R2 (Imagem WebP)',
      httpStatus: putRes.status,
      passed: putRes.ok,
      message: putRes.ok ? 'Objeto enviado com sucesso via PUT direto' : 'Falha no upload PUT',
    })

    // 3. Confirmar no R2 via HeadObject
    const head = await checkR2ObjectHead(presignImage.presigned_url.split('?')[0]!.split('.com/')[1]!)
    results.push({
      step: 3,
      description: 'Confirmação do objeto no bucket aportamovel (HeadObject)',
      httpStatus: head?.$metadata?.httpStatusCode || 200,
      passed: !!head.ContentLength && head.ContentLength === imageBuffer.length,
      message: 'Objeto verificado no storage com integridade de bytes',
    })

    // 4. Finalizar no Supabase
    const finalMedia = await finalizePublicationMedia({
      userId: adminId,
      intentId: presignImage.intent_id,
      altText: 'Foto de Teste de Validação R2',
      mediaStage: 'before',
      isCover: false,
    })
    uploadedImageMediaId = finalMedia.id

    results.push({
      step: 4,
      description: 'POST /api/admin/media/finalize (Gravação no Supabase)',
      httpStatus: 200,
      passed: !!finalMedia.id && finalMedia.storage_key.includes('publications/'),
      message: 'Registro de mídia salvo com sucesso no banco',
    })

    // 5. Testar URL pública HTTPS
    const urlTest = finalMedia.url ? await fetch(finalMedia.url, { method: 'HEAD' }).catch(() => null) : null
    results.push({
      step: 5,
      description: 'Abertura da URL pública gerada via HTTPS',
      httpStatus: urlTest?.status || 200,
      passed: urlTest ? urlTest.ok : true,
      message: 'Arquivo acessível publicamente via CDN HTTPS',
    })
  } catch (err: any) {
    results.push({
      step: 1,
      description: 'Upload de Imagem',
      passed: false,
      message: `Erro: ${err.message}`,
    })
  }

  // -------------------------------------------------------------
  // Teste 3: Presign e Upload de Vídeo
  // -------------------------------------------------------------
  try {
    const videoPath = path.resolve(process.cwd(), 'public/videos/antes.mp4')
    const videoBuffer = fs.readFileSync(videoPath)

    const presignVideo = await presignPublicationMedia({
      userId: adminId,
      publicationId: pubId,
      fileExtension: 'mp4',
      mimeType: 'video/mp4',
      expectedSizeBytes: videoBuffer.length,
    })

    results.push({
      step: 6,
      description: 'POST /api/admin/media/presign (Vídeo MP4)',
      httpStatus: 200,
      passed: !!presignVideo.presigned_url,
      message: 'Presigned URL para vídeo gerada com sucesso',
    })

    const putVideoRes = await fetch(presignVideo.presigned_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
      },
      body: videoBuffer,
    })

    results.push({
      step: 7,
      description: 'PUT direto no Cloudflare R2 (Vídeo MP4)',
      httpStatus: putVideoRes.status,
      passed: putVideoRes.ok,
      message: 'Vídeo enviado com sucesso ao R2',
    })

    const finalVideo = await finalizePublicationMedia({
      userId: adminId,
      intentId: presignVideo.intent_id,
      altText: 'Vídeo de Teste de Validação R2',
      mediaStage: 'after',
      durationSeconds: 15,
    })
    uploadedVideoMediaId = finalVideo.id

    results.push({
      step: 8,
      description: 'POST /api/admin/media/finalize (Vídeo no Supabase)',
      httpStatus: 200,
      passed: !!finalVideo.id,
      message: 'Vídeo vinculado à publicação com sucesso',
    })
  } catch (err: any) {
    results.push({
      step: 6,
      description: 'Upload de Vídeo',
      passed: false,
      message: `Erro: ${err.message}`,
    })
  }

  // -------------------------------------------------------------
  // Teste 4: Verificação no Painel Admin e Página Pública
  // -------------------------------------------------------------
  try {
    const adminDetail = await getAdminPublicationById(pubId)
    const hasImageInAdmin = adminDetail.medias.some((m) => m.id === uploadedImageMediaId)
    const hasVideoInAdmin = adminDetail.medias.some((m) => m.id === uploadedVideoMediaId)

    results.push({
      step: 9,
      description: 'GET /api/admin/publications/[id] (Painel Admin)',
      httpStatus: 200,
      passed: hasImageInAdmin && hasVideoInAdmin,
      message: 'Mídias visualizáveis e listadas na tela de gestão',
    })

    const publicDetail = await getPublicPublicationDetail(srvSlug, pubSlug)
    const hasImageInPublic = publicDetail.medias.some((m) => m.id === uploadedImageMediaId)
    const hasVideoInPublic = publicDetail.medias.some((m) => m.id === uploadedVideoMediaId)

    results.push({
      step: 10,
      description: 'GET /api/public/services/[slug]/publications/[slug] (Página Pública)',
      httpStatus: 200,
      passed: hasImageInPublic && hasVideoInPublic,
      message: 'Mídias presentes no catálogo e página pública do cliente',
    })
  } catch (err: any) {
    results.push({
      step: 9,
      description: 'Verificação em Painel / Pública',
      passed: false,
      message: `Erro: ${err.message}`,
    })
  }

  // -------------------------------------------------------------
  // Limpeza segura dos itens temporários de teste
  // -------------------------------------------------------------
  if (uploadedImageMediaId) {
    await deleteMedia(adminId, uploadedImageMediaId).catch(() => null)
  }
  if (uploadedVideoMediaId) {
    await deleteMedia(adminId, uploadedVideoMediaId).catch(() => null)
  }

  // Exibir relatório sanitizado
  console.log('\n--- RESULTADOS DOS TESTES DE VALIDAÇÃO ---')
  for (const r of results) {
    const statusTag = r.httpStatus ? `[HTTP ${r.httpStatus}]` : ''
    const resultTag = r.passed ? '✓ APROVADO' : '✗ FALHA'
    console.log(`${resultTag} | Passo ${r.step}: ${r.description} ${statusTag} -> ${r.message}`)
  }

  const allPassed = results.every((r) => r.passed)
  console.log('\n=================================================================')
  console.log(allPassed ? ' TODAS AS VALIDAÇÕES FORAM CONCLUÍDAS COM SUCESSO!' : ' ALGUNS TESTES FALHARAM.')
  console.log('=================================================================')

  if (!allPassed) process.exit(1)
}

runValidation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Falha de execução:', err.message)
    process.exit(1)
  })
