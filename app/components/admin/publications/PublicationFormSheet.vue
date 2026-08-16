<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { AdminPublicationDetail, ServiceMedia } from '~/../shared/types/publications'
import type { Service } from '~/../shared/types/services'
import { useMediaUpload } from '~/composables/useMediaUpload'
import MediaUploader from './MediaUploader.vue'
import MediaReorderList from './MediaReorderList.vue'

const props = defineProps<{
  show: boolean
  publication: AdminPublicationDetail | null
  services: Service[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-info', payload: any): void
  (e: 'refresh-detail', pubId: string): void
}>()

const serviceId = ref('')
const title = ref('')
const slug = ref('')
const summary = ref('')
const description = ref('')
const displayOrder = ref(0)
const localMedias = ref<ServiceMedia[]>([])

const { reorderPublicationMedia, setPublicationCover, deletePublicationMedia } = useMediaUpload()

watch(
  () => props.publication,
  (p) => {
    serviceId.value = p?.service_id || props.services[0]?.id || ''
    title.value = p?.title || ''
    slug.value = p?.slug || ''
    summary.value = p?.summary || ''
    description.value = p?.description || ''
    displayOrder.value = p?.display_order || 0
    localMedias.value = p ? [...p.medias] : []
  },
  { immediate: true }
)

const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.show) emit('close') }
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function autoSlug() {
  if (!props.publication) {
    slug.value = title.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
}

function handleSaveInfo() {
  emit('save-info', {
    service_id: serviceId.value,
    title: title.value,
    slug: slug.value,
    summary: summary.value,
    description: description.value,
    display_order: displayOrder.value,
  })
}

async function handleMoveUp(index: number) {
  if (index <= 0 || !props.publication) return
  const newArr = [...localMedias.value]
  const [current, prev] = [newArr[index]!, newArr[index - 1]!]
  newArr[index] = prev
  newArr[index - 1] = current
  localMedias.value = newArr
  await reorderPublicationMedia(props.publication.id, newArr.map((m) => m.id))
  emit('refresh-detail', props.publication.id)
}

async function handleMoveDown(index: number) {
  if (index >= localMedias.value.length - 1 || !props.publication) return
  const newArr = [...localMedias.value]
  const [current, next] = [newArr[index]!, newArr[index + 1]!]
  newArr[index] = next
  newArr[index + 1] = current
  localMedias.value = newArr
  await reorderPublicationMedia(props.publication.id, newArr.map((m) => m.id))
  emit('refresh-detail', props.publication.id)
}

async function handleSetCover(mediaId: string) {
  if (!props.publication) return
  await setPublicationCover(props.publication.id, mediaId)
  emit('refresh-detail', props.publication.id)
}

async function handleDeleteMedia(mediaId: string) {
  if (props.publication && confirm('Deseja realmente remover esta mídia?')) {
    await deletePublicationMedia(mediaId)
    emit('refresh-detail', props.publication.id)
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end" @click.self="$emit('close')">
    <div class="bg-white h-screen w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      <!-- Header Fixo com Botão Voltar -->
      <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-6 py-4 flex items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 min-h-[36px]"
            title="Voltar para a lista"
            @click="$emit('close')"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Voltar</span>
          </button>
          <h3 class="text-base font-bold text-slate-800 truncate">
            {{ publication ? 'Gerenciar Publicação' : 'Nova Publicação' }}
          </h3>
        </div>
        <button type="button" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-lg" title="Fechar" @click="$emit('close')">&times;</button>
      </div>

      <!-- Conteúdo com Scroll -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Serviço Vinculado</label>
            <select v-model="serviceId" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
              <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Título do Trabalho</label>
            <input v-model="title" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" @input="autoSlug" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Slug</label>
            <input v-model="slug" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Resumo Curto (para o card)</label>
            <input v-model="summary" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição Completa da Obra</label>
            <textarea v-model="description" rows="4" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <button type="button" class="w-full py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]" @click="handleSaveInfo">
            Salvar Dados da Publicação
          </button>
        </div>

        <!-- Seção de Mídias (se já salva) -->
        <div v-if="publication" class="pt-6 border-t border-slate-200 space-y-6">
          <MediaUploader :publication-id="publication.id" :current-media-count="localMedias.length" @uploaded="emit('refresh-detail', publication.id)" />
          <MediaReorderList :medias="localMedias" @move-up="handleMoveUp" @move-down="handleMoveDown" @set-cover="handleSetCover" @delete-media="handleDeleteMedia" />
        </div>
      </div>

      <!-- Rodapé Fixo com Botão Voltar -->
      <div class="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-3 shadow-lg">
        <button type="button" class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[38px]" @click="$emit('close')">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Voltar ao Painel</span>
        </button>
        <button type="button" class="px-5 py-2 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-colors min-h-[38px]" @click="handleSaveInfo">
          Salvar Dados
        </button>
      </div>
    </div>
  </div>
</template>
