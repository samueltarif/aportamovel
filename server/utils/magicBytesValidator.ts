import { getR2ObjectRange } from './r2Client'

export function validateMagicBytesBuffer(buffer: Buffer, expectedMime: string): boolean {
  if (buffer.length < 12) return false

  // JPEG: FF D8 FF
  if (expectedMime === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (expectedMime === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    )
  }

  // WebP: RIFF .... WEBP
  if (expectedMime === 'image/webp') {
    const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    const isWebp = buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    return isRiff && isWebp
  }

  // AVIF: ....ftypavif ou ....ftypavis
  if (expectedMime === 'image/avif') {
    const ftyp = buffer.subarray(4, 12).toString('ascii')
    return ftyp.includes('ftyp') && (ftyp.includes('avif') || ftyp.includes('avis'))
  }

  // MP4: ....ftyp (isom, mp41, mp42, MSNV, avc1, etc)
  if (expectedMime === 'video/mp4') {
    const ftyp = buffer.subarray(4, 8).toString('ascii')
    return ftyp === 'ftyp'
  }

  // WebM: 1A 45 DF A3 (EBML ID)
  if (expectedMime === 'video/webm') {
    return buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3
  }

  return false
}

export async function verifyR2ObjectMagicBytes(storageKey: string, expectedMime: string): Promise<boolean> {
  try {
    const response = await getR2ObjectRange(storageKey, 'bytes=0-511')
    if (!response.Body) return false

    const stream = response.Body as NodeJS.ReadableStream
    const chunks: Buffer[] = []

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const fullBuffer = Buffer.concat(chunks)
    return validateMagicBytesBuffer(fullBuffer, expectedMime)
  } catch (error) {
    console.error(`[MagicBytes] Erro ao ler objeto ${storageKey}:`, error)
    return false
  }
}
