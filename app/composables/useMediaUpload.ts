import { ref } from 'vue'

const EXT_MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

function resolveFileMime(file: File, ext: string): string {
  if (file.type && file.type.trim() !== '') return file.type
  return EXT_MIME_MAP[ext] || 'application/octet-stream'
}

export function useMediaUpload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  const uploadServiceCardImage = async (serviceId: string, file: File, altText: string) => {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      if (ext === 'jfif') ext = 'jpeg'
      const mimeType = resolveFileMime(file, ext)

      const presignRes = await $fetch<{ intent_id: string; presigned_url: string }>('/api/admin/services/card-image/presign', {
        method: 'POST',
        body: {
          target_id: serviceId,
          file_extension: ext,
          mime_type: mimeType,
          expected_size_bytes: file.size,
        },
      })

      progress.value = 30

      const uploadRes = await fetch(presignRes.presigned_url, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error('Falha no upload direto para o storage R2.')
      }

      progress.value = 75

      const finalizeRes = await $fetch<{ success: boolean; service: any }>('/api/admin/services/card-image/finalize', {
        method: 'POST',
        body: {
          intent_id: presignRes.intent_id,
          alt_text: altText,
        },
      })

      progress.value = 100
      return finalizeRes.service
    } catch (err: any) {
      error.value = err?.message || 'Erro durante o upload da imagem do card.'
      throw err
    } finally {
      uploading.value = false
    }
  }

  const uploadPublicationMedia = async (params: {
    publicationId: string
    file: File
    altText: string
    caption?: string
    mediaStage?: 'before' | 'after' | 'general'
    isCover?: boolean
  }) => {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      let ext = params.file.name.split('.').pop()?.toLowerCase() || 'jpg'
      if (ext === 'jfif') ext = 'jpeg'
      const mimeType = resolveFileMime(params.file, ext)

      const presignRes = await $fetch<{ intent_id: string; presigned_url: string }>('/api/admin/media/presign', {
        method: 'POST',
        body: {
          target_id: params.publicationId,
          file_extension: ext,
          mime_type: mimeType,
          expected_size_bytes: params.file.size,
        },
      })

      progress.value = 30

      const uploadRes = await fetch(presignRes.presigned_url, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
        },
        body: params.file,
      })

      if (!uploadRes.ok) {
        throw new Error('Falha no upload direto para o storage R2.')
      }

      progress.value = 75

      const finalizeRes = await $fetch<{ success: boolean; media: any }>('/api/admin/media/finalize', {
        method: 'POST',
        body: {
          intent_id: presignRes.intent_id,
          alt_text: params.altText,
          caption: params.caption,
          media_stage: params.mediaStage || 'general',
          is_cover: params.isCover || false,
        },
      })

      progress.value = 100
      return finalizeRes.media
    } catch (err: any) {
      error.value = err?.message || 'Erro durante o upload da mídia.'
      throw err
    } finally {
      uploading.value = false
    }
  }

  const reorderPublicationMedia = async (publicationId: string, mediaIds: string[]) => {
    return await $fetch('/api/admin/media/reorder', {
      method: 'PATCH',
      body: { publication_id: publicationId, media_ids: mediaIds },
    })
  }

  const setPublicationCover = async (publicationId: string, mediaId: string) => {
    return await $fetch('/api/admin/media/cover', {
      method: 'PATCH',
      body: { publication_id: publicationId, media_id: mediaId },
    })
  }

  const deletePublicationMedia = async (mediaId: string) => {
    return await $fetch(`/api/admin/media/${mediaId}`, {
      method: 'DELETE',
    })
  }

  return {
    uploading,
    progress,
    error,
    uploadServiceCardImage,
    uploadPublicationMedia,
    reorderPublicationMedia,
    setPublicationCover,
    deletePublicationMedia,
  }
}
