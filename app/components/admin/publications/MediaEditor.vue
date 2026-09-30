<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import type { ServiceMedia } from '~/../shared/types/publications'
import { useMediaUpload } from '~/composables/useMediaUpload'
import MediaPreview from '~/components/media/MediaPreview.vue'

const props = defineProps<{ media: ServiceMedia }>()
const emit = defineEmits<{
  (e: 'saved', media: ServiceMedia): void
  (e: 'cancel'): void
  (e: 'busy', busy: boolean): void
}>()
const altText = ref(props.media.alt_text)
const caption = ref(props.media.caption || '')
const stage = ref(props.media.media_stage)
const file = ref<File | null>(null)
const preview = ref('')
const saving = ref(false)
const error = ref('')
const { uploadPublicationMedia } = useMediaUpload()
function selectFile(event: Event) {
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = (event.target as HTMLInputElement).files?.[0] || null
  preview.value = file.value ? URL.createObjectURL(file.value) : ''
}
onBeforeUnmount(() => { if (preview.value) URL.revokeObjectURL(preview.value) })
async function save() {
  if (saving.value) return
  saving.value = true
  emit('busy', true)
  error.value = ''
  try {
    const media = file.value
      ? await uploadPublicationMedia({
          publicationId: props.media.publication_id, replaceMediaId: props.media.id,
          file: file.value, altText: altText.value, caption: caption.value, mediaStage: stage.value,
        })
      : (await $fetch<{ media: ServiceMedia }>(`/api/admin/media/${props.media.id}`, {
          method: 'PATCH', body: { alt_text: altText.value, caption: caption.value, media_stage: stage.value },
        })).media
    emit('saved', media)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Não foi possível salvar. Tente novamente.'
  } finally {
    saving.value = false
    emit('busy', false)
  }
}
</script>

<template>
  <form class="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-3" @submit.prevent="save">
    <h4 class="text-sm font-bold text-slate-800">Editar mídia</h4>
    <fieldset :disabled="saving" class="space-y-3">
      <MediaPreview :src="preview || media.url" :media-type="file ? (file.type.startsWith('video/') ? 'video' : 'image') : media.media_type" :alt-text="altText" size="md" />
      <label class="block text-xs font-bold text-slate-700">
        Texto Alternativo (Alt Text)
        <input v-model="altText" required minlength="3" maxlength="200" class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" />
      </label>
      <p class="text-xs text-slate-500">Usado para acessibilidade. Não aparece como legenda abaixo da foto.</p>
      <label class="block text-xs font-bold text-slate-700">
        Legenda (opcional)
        <textarea v-model="caption" maxlength="500" rows="2" class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" />
      </label>
      <label class="block text-xs font-bold text-slate-700">
        Etapa da obra
        <select v-model="stage" class="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm">
          <option value="general">Geral / Portfólio</option><option value="before">Antes</option><option value="after">Depois</option>
        </select>
      </label>
      <label class="block text-xs font-bold text-slate-700">
        Substituir arquivo (opcional)
        <input type="file" :accept="media.media_type === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/avif,.jfif'" class="block mt-2 w-full text-xs" @change="selectFile" />
      </label>
      <p class="text-xs text-slate-500">Foto até 10 MB ou vídeo até 100 MB. A troca preserva os textos, a posição e a definição de capa.</p>
      <p v-if="error" role="alert" class="text-xs text-red-700">{{ error }}</p>
      <div class="flex gap-2">
        <button type="submit" class="px-4 py-3 rounded-xl bg-[#09357a] text-white text-xs font-bold disabled:opacity-50">{{ saving ? 'Salvando...' : 'Salvar mídia' }}</button>
        <button type="button" class="px-4 py-3 rounded-xl bg-white text-xs font-bold" @click="emit('cancel')">Cancelar</button>
      </div>
    </fieldset>
  </form>
</template>
