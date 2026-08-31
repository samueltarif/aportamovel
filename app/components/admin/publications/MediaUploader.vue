<script setup lang="ts">
import { ref } from 'vue'
import { useMediaUpload } from '~/composables/useMediaUpload'
import MediaPreview from '~/components/media/MediaPreview.vue'

const props = defineProps<{
  publicationId: string
  currentMediaCount: number
}>()

const emit = defineEmits<{
  (e: 'uploaded', media: any): void
}>()

const selectedFile = ref<File | null>(null)
const selectedFilePreviewUrl = ref<string | null>(null)
const altText = ref('')
const caption = ref('')
const mediaStage = ref<'before' | 'after' | 'general'>('general')
const isCover = ref(false)
const successMessage = ref<string | null>(null)

const { uploading, progress, error, uploadPublicationMedia } = useMediaUpload()

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    selectedFilePreviewUrl.value = URL.createObjectURL(target.files[0])
    successMessage.value = null
  } else {
    selectedFile.value = null
    selectedFilePreviewUrl.value = null
  }
}

async function handleUpload() {
  if (!selectedFile.value) return
  successMessage.value = null

  const resolvedAltText = altText.value.trim().length >= 3
    ? altText.value.trim()
    : (selectedFile.value.name.replace(/\.[^/.]+$/, '').slice(0, 100) || 'Foto do serviço')

  try {
    const media = await uploadPublicationMedia({
      publicationId: props.publicationId,
      file: selectedFile.value,
      altText: resolvedAltText,
      caption: caption.value || undefined,
      mediaStage: mediaStage.value,
      isCover: isCover.value,
    })

    emit('uploaded', media)
    selectedFile.value = null
    selectedFilePreviewUrl.value = null
    altText.value = ''
    caption.value = ''
    mediaStage.value = 'general'
    isCover.value = false
    successMessage.value = 'Mídia enviada e vinculada com sucesso!'
    setTimeout(() => { successMessage.value = null }, 4000)
  } catch (err) {
    console.error('[MediaUploader] Erro:', err)
  }
}
</script>

<template>
  <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Adicionar Nova Mídia</h4>
      <span class="text-xs font-mono font-bold text-slate-500">{{ currentMediaCount }} / 6 mídias</span>
    </div>

    <div v-if="currentMediaCount >= 6" class="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium">
      Limite máximo de 6 mídias atingido para esta publicação.
    </div>

    <form v-else @submit.prevent="handleUpload" class="space-y-3">
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Arquivo (Foto até 10MB, Vídeo até 100MB)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,image/jfif,image/pjpeg,.jpg,.jpeg,.jfif,.png,.webp,.avif,.mp4,.webm"
          required
          class="text-xs w-full"
          @change="onFileSelected"
        />
      </div>

      <!-- Prévia do arquivo selecionado antes de enviar -->
      <div v-if="selectedFile && selectedFilePreviewUrl" class="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <MediaPreview
          :src="selectedFilePreviewUrl"
          :media-type="selectedFile.type.startsWith('video/') ? 'video' : 'image'"
          :mime-type="selectedFile.type"
          size="xs"
          rounded="md"
        />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-slate-800 truncate">{{ selectedFile.name }}</p>
          <p class="text-[10px] text-slate-400 font-mono">{{ (selectedFile.size / (1024 * 1024)).toFixed(2) }} MB</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Etapa da Obra</label>
          <select v-model="mediaStage" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
            <option value="general">Geral / Portfólio</option>
            <option value="before">1. Antes (Situação Inicial)</option>
            <option value="after">2. Depois (Resultado Final)</option>
          </select>
        </div>

        <div class="flex items-center pt-6">
          <label class="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input v-model="isCover" type="checkbox" class="rounded text-[#09357a]" />
            <span>Definir como capa inicial</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Texto Alternativo (Alt Text)</label>
        <input
          v-model="altText"
          type="text"
          maxlength="200"
          placeholder="Ex: Foto do portão antes da manutenção preventiva"
          class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
        />
        <p class="text-[10px] text-slate-400 mt-0.5">Descrição para acessibilidade e SEO (mínimo 3 caracteres; gerado automaticamente se vazio).</p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Legenda (Opcional)</label>
        <input
          v-model="caption"
          type="text"
          placeholder="Ex: Passo 1 - Remoção da estrutura oxidada"
          class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
        />
      </div>

      <div v-if="successMessage" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200">
        <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        <span>{{ successMessage }}</span>
      </div>

      <div v-if="uploading" class="space-y-1">
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div class="bg-[#09357a] h-full transition-all duration-300" :style="{ width: `${progress}%` }" />
        </div>
        <p class="text-[11px] text-slate-500 text-right">Enviando e validando segurança... {{ progress }}%</p>
      </div>

      <p v-if="error" class="text-xs text-red-600 font-bold p-2 bg-red-50 rounded-lg border border-red-200">{{ error }}</p>

      <button
        type="submit"
        :disabled="uploading || !selectedFile"
        class="w-full py-3 px-4 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center space-x-2 active:scale-[0.99] shadow-sm cursor-pointer disabled:cursor-not-allowed"
      >
        <span v-if="uploading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ uploading ? `Enviando Mídia (${progress}%)...` : 'Adicionar Mídia' }}</span>
      </button>
    </form>
  </div>
</template>
