<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string | null | undefined
    mediaType?: 'image' | 'video' | string | null
    mimeType?: string | null
    altText?: string
    caption?: string
    posterUrl?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'full'
    aspectRatio?: 'video' | 'square' | 'auto'
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    showBadges?: boolean
    mediaStage?: 'before' | 'after' | 'general' | null
    isCover?: boolean
    interactive?: boolean
  }>(),
  {
    src: '',
    mediaType: null,
    mimeType: null,
    altText: '',
    caption: '',
    posterUrl: null,
    size: 'full',
    aspectRatio: 'auto',
    rounded: 'lg',
    showBadges: false,
    mediaStage: null,
    isCover: false,
    interactive: false,
  }
)

const hasError = ref(false)
const isLoading = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)

// Resolver URL normalizada (caminhos locais ou R2)
const resolvedSrc = computed(() => {
  if (!props.src) return ''
  const s = props.src.trim()
  if (s.startsWith('public/images/')) return `/${s.replace(/^public\//, '')}`
  if (s.startsWith('images/')) return `/${s}`
  return s
})

// Determinar tipo de mídia com base em: 1) mediaType, 2) mimeType, 3) extensão
const isVideo = computed(() => {
  if (props.mediaType === 'video') return true
  if (props.mediaType === 'image') return false
  if (props.mimeType?.startsWith('video/')) return true
  if (props.mimeType?.startsWith('image/')) return false
  const clean = resolvedSrc.value.split('?')[0]!.toLowerCase()
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg')
})

watch(
  () => props.src,
  () => {
    hasError.value = false
    isLoading.value = true
  }
)

function onImageLoad() {
  isLoading.value = false
}

function onImageError() {
  isLoading.value = false
  hasError.value = true
}

function onVideoMetadata() {
  isLoading.value = false
  if (videoRef.value && !props.posterUrl) {
    try {
      videoRef.value.currentTime = 0.1
    } catch {
      // Ignorar caso navegador bloqueie seek antes do buffer
    }
  }
}

function onVideoError() {
  isLoading.value = false
  hasError.value = true
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-12 h-10'
    case 'sm': return 'w-16 h-12'
    case 'md': return 'w-24 h-16'
    case 'lg': return 'w-full h-48'
    default: return 'w-full h-full'
  }
})

const aspectClasses = computed(() => {
  switch (props.aspectRatio) {
    case 'video': return 'aspect-video'
    case 'square': return 'aspect-square'
    default: return ''
  }
})

const roundedClasses = computed(() => {
  switch (props.rounded) {
    case 'none': return 'rounded-none'
    case 'sm': return 'rounded-sm'
    case 'md': return 'rounded-md'
    case 'xl': return 'rounded-xl'
    case '2xl': return 'rounded-2xl'
    case 'full': return 'rounded-full'
    default: return 'rounded-lg'
  }
})
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200/80',
      sizeClasses,
      aspectClasses,
      roundedClasses,
    ]"
  >
    <!-- Placeholder / Fallback quando URL vazia ou com erro -->
    <div v-if="!resolvedSrc || hasError" class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center select-none bg-slate-50">
      <svg v-if="isVideo" class="w-5 h-5 opacity-60 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-5 h-5 opacity-60 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-[10px] font-semibold text-slate-400 leading-tight">{{ isVideo ? 'Vídeo Indisponível' : 'Sem Imagem' }}</span>
    </div>

    <!-- Renderização de Vídeo -->
    <template v-else-if="isVideo">
      <video
        ref="videoRef"
        :src="resolvedSrc"
        :poster="posterUrl || undefined"
        muted
        playsinline
        preload="metadata"
        class="w-full h-full object-cover"
        @loadedmetadata="onVideoMetadata"
        @error="onVideoError"
      />
      <!-- Ícone Indicador de Play no Vídeo -->
      <div class="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none transition-opacity group-hover:bg-black/15">
        <div class="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center shadow-sm backdrop-blur-xs">
          <svg class="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </template>

    <!-- Renderização de Imagem -->
    <img
      v-else
      :src="resolvedSrc"
      :alt="altText || 'Prévia da mídia'"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-cover"
      @load="onImageLoad"
      @error="onImageError"
    />

    <!-- Badges Opcionais -->
    <div v-if="showBadges" class="absolute top-1 left-1 right-1 flex items-center justify-between gap-1 pointer-events-none">
      <div class="flex items-center gap-1">
        <span v-if="isCover" class="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-extrabold uppercase shadow-xs">
          Capa
        </span>
        <span v-if="mediaStage" class="px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold uppercase backdrop-blur-xs">
          {{ mediaStage === 'before' ? 'Antes' : mediaStage === 'after' ? 'Depois' : 'Geral' }}
        </span>
      </div>
      <span class="px-1.5 py-0.5 rounded-md bg-white/90 text-slate-700 text-[9px] font-extrabold uppercase shadow-xs">
        {{ isVideo ? 'Vídeo' : 'Foto' }}
      </span>
    </div>
  </div>
</template>
