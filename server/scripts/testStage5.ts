import fs from 'node:fs'
import path from 'node:path'
import { getPrivateSupabaseClient } from '../utils/supabasePrivate'
import { getAdminServicesList, createAdminService, updateAdminService, activateAdminService, archiveAdminService } from '../services/services/serviceAdminService'
import { getPublicServicesList } from '../services/services/servicePublicService'
import { getAdminPublicationsList, getAdminPublicationById, createAdminPublication, updateAdminPublication, publishAdminPublication, archiveAdminPublication } from '../services/publications/publicationAdminService'
import { getPublicPublicationsList, getPublicPublicationDetail } from '../services/publications/publicationPublicService'
import { presignPublicationMedia, setMediaCover, reorderMedia, deleteMedia } from '../services/media/mediaAdminService'
import { presignServiceCardImage } from '../services/services/serviceCardUploadService'
import { processR2OrphanQueue } from '../services/media/r2CleanupService'

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

async function runAllTests() {
  console.log('=================================================================')
  console.log(' INICIANDO BATERIA DE TESTES AUTOMATIZADOS — ETAPA 5 (22 CENÁRIOS)')
  console.log('=================================================================\n')

  const supabase = getPrivateSupabaseClient()
  let adminUserId = ''

  // Obter admin real do banco
  const { data: adminUser } = await supabase.from('admin_users').select('user_id').eq('is_active', true).limit(1).single()
  if (adminUser) {
    adminUserId = (adminUser as any).user_id
  } else {
    adminUserId = crypto.randomUUID()
  }

  const results: { scenario: number; name: string; passed: boolean; details?: string }[] = []

  async function test(scenario: number, name: string, fn: () => Promise<void>) {
    try {
      await fn()
      results.push({ scenario, name, passed: true })
      console.log(`[PASS] Cenário ${scenario}: ${name}`)
    } catch (err: any) {
      results.push({ scenario, name, passed: false, details: err.message })
      console.error(`[FAIL] Cenário ${scenario}: ${name} ->`, err.message)
    }
  }

  // 1. Catálogo público completo
  await test(1, 'Catálogo público GET retorna 7 serviços ativos', async () => {
    const list = await getPublicServicesList()
    if (list.length < 7) throw new Error(`Esperado pelo menos 7 serviços, retornou ${list.length}`)
  })

  // 2. Catálogo público apenas destacados
  await test(2, 'Catálogo público retorna serviços destacados ordenados por home_display_order', async () => {
    const list = await getPublicServicesList({ onlyFeatured: true })
    if (list.length === 0) throw new Error('Nenhum serviço destacado retornado')
    for (let i = 1; i < list.length; i++) {
      if (list[i]!.home_display_order < list[i - 1]!.home_display_order) {
        throw new Error('Ordenação por home_display_order incorreta')
      }
    }
  })

  // 3. Listagem pública de publicações com paginação
  await test(3, 'Listagem pública de publicações com contagem de mídias e paginação', async () => {
    const res = await getPublicPublicationsList({ page: 1, limit: 10 })
    if (!res.pagination || res.items === undefined) throw new Error('Estrutura de paginação inválida')
    if (res.items.length > 0) {
      const first = res.items[0]!
      if (!first.cover_url) throw new Error('Capa ausente na publicação')
    }
  })

  // 4. Detalhe público de publicação
  await test(4, 'Detalhe público de publicação por slug de serviço e slug de trabalho', async () => {
    const detail = await getPublicPublicationDetail('manutencao-portoes', 'restauracao-portao-pivotante-ferrugem')
    if (!detail || detail.slug !== 'restauracao-portao-pivotante-ferrugem') {
      throw new Error('Publicação não encontrada ou dados divergentes')
    }
    if (detail.medias.length !== 2) {
      throw new Error(`Esperado 2 mídias no seed, encontrado ${detail.medias.length}`)
    }
  })

  // 5. Transição 404 para trabalho inexistente
  await test(5, 'Transição 404 para publicação inexistente', async () => {
    try {
      await getPublicPublicationDetail('manutencao-portoes', 'slug-totalmente-inexistente-12345')
      throw new Error('Deveria ter lançado 404')
    } catch (err: any) {
      if (!err.message?.includes('não encontrada') && err.statusCode !== 404) throw err
    }
  })

  // 6. Listagem administrativa de serviços
  await test(6, 'Listagem administrativa de serviços retorna todos os registros com card_image_url', async () => {
    const services = await getAdminServicesList()
    if (services.length < 7) throw new Error(`Esperado pelo menos 7 serviços, retornou ${services.length}`)
    const first = services[0]!
    if (!first.card_image_url) throw new Error('card_image_url não resolvida')
  })

  // 7. Criação e conflito de slug em serviços
  let createdServiceId = ''
  await test(7, 'Criação de serviço administrativo e proteção contra slug duplicado (409)', async () => {
    const testSlug = `teste-servico-${Date.now()}`
    const created = await createAdminService(adminUserId, {
      name: 'Serviço Temporário de Teste',
      slug: testSlug,
      short_description: 'Descrição curta para teste',
      description: 'Descrição detalhada para teste de conformidade',
      icon_key: 'shield',
      accent_variant: 'blue',
      is_featured: false,
    })
    createdServiceId = created.id
    if (!createdServiceId) throw new Error('ID do serviço não retornado')

    try {
      await createAdminService(adminUserId, {
        name: 'Duplicado',
        slug: testSlug,
        short_description: 'Curta',
        description: 'Longa',
        icon_key: 'shield',
      })
      throw new Error('Deveria ter falhado por slug duplicado')
    } catch (err: any) {
      if (!err.message?.includes('slug') && err.statusCode !== 409) throw err
    }
  })

  // 8. Edição de serviço
  await test(8, 'Edição de serviço administrativo', async () => {
    const updated = await updateAdminService(adminUserId, createdServiceId, {
      short_description: 'Descrição atualizada com sucesso',
    })
    if (updated.short_description !== 'Descrição atualizada com sucesso') {
      throw new Error('Atualização de serviço não persistiu')
    }
  })

  // 9. Bloqueio de ativação atômica se card_image ausente
  await test(9, 'Ativação atômica bloqueia serviço sem card_image_storage_key', async () => {
    try {
      await activateAdminService(adminUserId, createdServiceId)
      throw new Error('Deveria ter bloqueado ativação de serviço sem imagem')
    } catch (err: any) {
      if (!err.message?.includes('imagem') && !err.message?.includes('card_image')) throw err
    }
  })

  // 10. Arquivamento de serviço
  await test(10, 'Arquivamento de serviço administrativo desativa o serviço', async () => {
    const archived = await archiveAdminService(adminUserId, createdServiceId, true)
    if (!archived.archived_at || archived.is_active) {
      throw new Error('Serviço não foi arquivado corretamente')
    }
  })

  // 11. Presign de imagem de card de serviço
  await test(11, 'Geração de URL presign para card de serviço no R2', async () => {
    const presign = await presignServiceCardImage({
      userId: adminUserId,
      serviceId: createdServiceId,
      fileExtension: 'webp',
      mimeType: 'image/webp',
      expectedSizeBytes: 309422,
    })
    if (!presign.intent_id || !presign.presigned_url.includes('r2.cloudflarestorage.com')) {
      throw new Error('Presign de imagem de card inválido')
    }
  })

  // 12. Listagem administrativa de publicações
  await test(12, 'Listagem administrativa de publicações com dados do serviço associado', async () => {
    const pubs = await getAdminPublicationsList()
    if (pubs.length === 0) throw new Error('Nenhuma publicação encontrada no admin')
    if (!(pubs[0] as any)!.service_name) throw new Error('Nome do serviço ausente no join')
  })

  // 13. Criação de publicação em rascunho
  let createdPubId = ''
  await test(13, 'Criação de publicação administrativa em estado draft', async () => {
    const services = await getAdminServicesList()
    const validService = services[0]!
    const testSlug = `trabalho-teste-${Date.now()}`
    const pub = await createAdminPublication(adminUserId, {
      service_id: validService.id,
      title: 'Trabalho de Teste Automatizado',
      slug: testSlug,
      summary: 'Resumo do trabalho para teste',
      description: 'Descrição completa do trabalho realizado para teste',
    })
    createdPubId = pub.id
    if (pub.status !== 'draft') throw new Error('Status inicial deve ser draft')
  })

  // 14. Bloqueio de publicação sem mídias obrigatórias
  await test(14, 'Bloqueio atômico de publicação sem mídias ou sem capa definida', async () => {
    try {
      await publishAdminPublication(adminUserId, createdPubId)
      throw new Error('Deveria ter bloqueado publicação sem mídias')
    } catch (err: any) {
      if (!err.message?.includes('mídia') && !err.message?.includes('capa')) throw err
    }
  })

  // 15. Presign de mídia de publicação
  await test(15, 'Geração de URL presign para mídia de publicação no R2', async () => {
    const presign = await presignPublicationMedia({
      userId: adminUserId,
      publicationId: createdPubId,
      fileExtension: 'webp',
      mimeType: 'image/webp',
      expectedSizeBytes: 880636,
    })
    if (!presign.intent_id || !presign.presigned_url.includes('r2.cloudflarestorage.com')) {
      throw new Error('Presign de mídia inválido')
    }
  })

  // 16. Inserção de mídias de teste
  let media1Id = ''
  let media2Id = ''
  await test(16, 'Inserção de mídias de teste para validação de ordenação e capa', async () => {
    const { data: m1, error: err1 } = await supabase.from('service_media').insert({
      publication_id: createdPubId,
      storage_key: 'services/recuperacao-gradis.webp',
      media_type: 'image',
      media_stage: 'before',
      mime_type: 'image/webp',
      size_bytes: 880636,
      alt_text: 'Mídia 1 Teste',
      sort_order: 1,
      is_cover: true,
    } as any).select().single()

    const { data: m2, error: err2 } = await supabase.from('service_media').insert({
      publication_id: createdPubId,
      storage_key: 'services/kit-corrente-portao.webp',
      media_type: 'image',
      media_stage: 'after',
      mime_type: 'image/webp',
      size_bytes: 634936,
      alt_text: 'Mídia 2 Teste',
      sort_order: 2,
      is_cover: false,
    } as any).select().single()

    if (err1 || err2 || !m1 || !m2) throw new Error('Falha ao inserir mídias de teste')
    media1Id = (m1 as any).id
    media2Id = (m2 as any).id
  })

  // 17. Troca atômica de capa via RPC set_media_cover_atomic
  await test(17, 'Troca atômica de capa via RPC set_media_cover_atomic', async () => {
    await setMediaCover(adminUserId, createdPubId, media2Id)
    const pubDetail = await getAdminPublicationById(createdPubId)
    const m1 = pubDetail.medias.find((m) => m.id === media1Id)
    const m2 = pubDetail.medias.find((m) => m.id === media2Id)
    if (!m2?.is_cover || m1?.is_cover) {
      throw new Error('Apenas a nova mídia deve ter is_cover=true')
    }
  })

  // 18. Reordenação atômica de mídias via RPC reorder_media_atomic
  await test(18, 'Reordenação atômica de mídias via RPC reorder_media_atomic', async () => {
    await reorderMedia(adminUserId, createdPubId, [media2Id, media1Id])
    const pubDetail = await getAdminPublicationById(createdPubId)
    const m2 = pubDetail.medias.find((m) => m.id === media2Id)
    const m1 = pubDetail.medias.find((m) => m.id === media1Id)
    if (m2?.sort_order !== 1 || m1?.sort_order !== 2) {
      throw new Error('Ordenação não foi atualizada para 1 e 2')
    }
  })

  // 19. Publicação atômica bem sucedida com mídias e capa
  await test(19, 'Publicação atômica bem-sucedida de trabalho quando invariantes são satisfeitas', async () => {
    const published = await publishAdminPublication(adminUserId, createdPubId)
    if (published.status !== 'published' || !published.published_at) {
      throw new Error('Status não atualizado para published')
    }
  })

  // 20. Limite estrito de 6 mídias
  await test(20, 'Garantia de limite máximo de 6 mídias por publicação no banco', async () => {
    for (let i = 3; i <= 6; i++) {
      await supabase.from('service_media').insert({
        publication_id: createdPubId,
        storage_key: `test/dummy-${i}.webp`,
        media_type: 'image',
        media_stage: 'general',
        mime_type: 'image/webp',
        size_bytes: 1000,
        alt_text: `Dummy ${i}`,
        sort_order: i,
        is_cover: false,
      } as any)
    }

    const { error: err7 } = await supabase.from('service_media').insert({
      publication_id: createdPubId,
      storage_key: 'test/dummy-7.webp',
      media_type: 'image',
      media_stage: 'general',
      mime_type: 'image/webp',
      size_bytes: 1000,
      alt_text: 'Dummy 7',
      sort_order: 7,
      is_cover: false,
    } as any)

    if (!err7 || !err7.message.includes('limite máximo de 6 mídias')) {
      throw new Error(`Esperado bloqueio de 6 mídias, mas recebeu: ${err7?.message || 'sucesso indevido'}`)
    }
  })

  // 21. Exclusão atômica de mídia
  await test(21, 'Exclusão atômica de mídia via RPC delete_media_atomic', async () => {
    await deleteMedia(adminUserId, media1Id)
    const pubDetail = await getAdminPublicationById(createdPubId)
    const exists = pubDetail.medias.some((m) => m.id === media1Id)
    if (exists) throw new Error('Mídia excluída ainda consta na publicação')
  })

  // 22. Fila de limpeza R2 e processamento
  await test(22, 'Processamento da fila r2_orphan_cleanup_queue e exclusão de órfãos', async () => {
    const dummyKey = `test-orphans/orphan-${Date.now()}.txt`
    await supabase.from('r2_orphan_cleanup_queue').insert({
      storage_key: dummyKey,
      reason: 'automated_test_orphan',
    } as any)

    const cleanupRes = await processR2OrphanQueue(10)
    if (cleanupRes.processed === 0) {
      throw new Error('Nenhum item processado na fila de limpeza')
    }
  })

  // Limpeza de registros de teste
  try {
    await supabase.from('service_media').delete().eq('publication_id', createdPubId)
    await supabase.from('service_publications').delete().eq('id', createdPubId)
    await supabase.from('services').delete().eq('id', createdServiceId)
  } catch {}

  console.log('\n=================================================================')
  const passedCount = results.filter((r) => r.passed).length
  const failedCount = results.filter((r) => !r.passed).length
  console.log(` RESULTADO FINAL: ${passedCount}/22 CENÁRIOS APROVADOS (${failedCount} falhas)`)
  console.log('=================================================================')

  if (failedCount > 0) process.exit(1)
}

runAllTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro fatal:', err)
    process.exit(1)
  })
