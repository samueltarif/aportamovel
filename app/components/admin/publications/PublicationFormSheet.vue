<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
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

// Estado inicial para detecção de alterações pendentes (dirty state)
const initialServiceId = ref('')
const initialTitle = ref('')
const initialSlug = ref('')
const initialSummary = ref('')
const initialDescription = ref('')
const initialDisplayOrder = ref(0)

const isSaving = ref(false)
const saveSuccess = ref(false)
const showUnsavedDialog = ref(false)

const { reorderPublicationMedia, setPublicationCover, deletePublicationMedia } = useMediaUpload()

function resetInitialState() {
  initialServiceId.value = serviceId.value
  initialTitle.value = title.value
  initialSlug.value = slug.value
  initialSummary.value = summary.value
  initialDescription.value = description.value
  initialDisplayOrder.value = displayOrder.value
}

watch(
  () => [props.publication, props.show],
  () => {
    if (props.show) {
      const p = props.publication
      serviceId.value = p?.service_id || props.services[0]?.id || ''
      title.value = p?.title || ''
      slug.value = p?.slug || ''
      summary.value = p?.summary || ''
      description.value = p?.description || ''
      displayOrder.value = p?.display_order || 0
      localMedias.value = p ? [...p.medias] : []
      saveSuccess.value = false
      showUnsavedDialog.value = false
      resetInitialState()
    }
  },
  { immediate: true }
)

const isDirty = computed(() => {
  return (
    serviceId.value !== initialServiceId.value ||
    title.value !== initialTitle.value ||
    slug.value !== initialSlug.value ||
    summary.value !== initialSummary.value ||
    description.value !== initialDescription.value ||
    displayOrder.value !== initialDisplayOrder.value
  )
})

function requestClose() {
  if (isDirty.value && !saveSuccess.value) {
    showUnsavedDialog.value = true
  } else {
    emit('close')
  }
}

function confirmLeaveWithoutSaving() {
  showUnsavedDialog.value = false
  emit('close')
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    if (showUnsavedDialog.value) {
      showUnsavedDialog.value = false
    } else {
      requestClose()
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function autoSlug() {
  if (!props.publication) {
    slug.value = title.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

async function handleSaveInfo() {
  if (isSaving.value) return
  isSaving.value = true
  saveSuccess.value = false

  try {
    emit('save-info', {
      service_id: serviceId.value,
      title: title.value,
      slug: slug.value,
      summary: summary.value,
      description: description.value,
      display_order: displayOrder.value,
    })
    resetInitialState()
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  } finally {
    isSaving.value = false
  }
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
  <div
    v-if="show"
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
    @click.self="requestClose"
  >
    <div class="bg-white h-screen w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 relative">
      <!-- Header Fixo com Botão Voltar -->
      <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 min-h-[38px] cursor-pointer"
            title="Voltar para a lista"
            @click="requestClose"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Voltar</span>
          </button>
          <h3 class="text-base font-bold text-slate-800 truncate">
            {{ publication ? 'Gerenciar Publicação' : 'Nova Publicação' }}
          </h3>
        </div>
        <button
          type="button"
          class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
          title="Fechar"
          @click="requestClose"
        >
          &times;
        </button>
      </div>

      <!-- Conteúdo com Scroll -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <!-- Notificação de Sucesso ao Salvar Dados em Rascunho -->
        <div
          v-if="saveSuccess"
          class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-3 shadow-xs animate-in fade-in duration-200"
        >
          <div class="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Publicação salva em rascunho!</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Serviço Vinculado</label>
            <select v-model="serviceId" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-[#09357a]/20">
              <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Título do Trabalho</label>
            <input v-model="title" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#09357a]/20" @input="autoSlug" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Slug</label>
            <input v-model="slug" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-[#09357a]/20" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Resumo Curto (para o card)</label>
            <input v-model="summary" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#09357a]/20" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição Completa da Obra</label>
            <textarea v-model="description" rows="4" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#09357a]/20" />
          </div>
          <button
            type="button"
            :disabled="isSaving"
            class="w-full py-3 px-4 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] flex items-center justify-center space-x-2 active:scale-[0.99] shadow-sm cursor-pointer disabled:opacity-50"
            @click="handleSaveInfo"
          >
            <span v-if="isSaving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isSaving ? 'Salvando Rascunho...' : 'Salvar Dados da Publicação' }}</span>
          </button>
        </div>

        <!-- Seção de Mídias (se já salva) -->
        <div v-if="publication" class="pt-6 border-t border-slate-200 space-y-6">
          <MediaUploader :publication-id="publication.id" :current-media-count="localMedias.length" @uploaded="emit('refresh-detail', publication.id)" />
          <MediaReorderList :medias="localMedias" @move-up="handleMoveUp" @move-down="handleMoveDown" @set-cover="handleSetCover" @delete-media="handleDeleteMedia" />
        </div>
      </div>

      <!-- Rodapé Fixo com Botões Responsivos -->
      <div class="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <button
          type="button"
          class="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[44px] cursor-pointer active:scale-95 border border-slate-200/80"
          @click="requestClose"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Voltar ao Painel</span>
        </button>

        <button
          type="button"
          :disabled="isSaving"
          class="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
          @click="handleSaveInfo"
        >
          <span v-if="isSaving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isSaving ? 'Salvando...' : 'Salvar Dados' }}</span>
        </button>
      </div>

      <!-- Modal Overlay de Confirmação para Alterações Não Salvas -->
      <div
        v-if="showUnsavedDialog"
        class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        @click.self="showUnsavedDialog = false"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 border border-slate-100">
          <div class="flex items-center space-x-3.5 text-amber-600">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-bold text-slate-800">Alterações Não Salvas</h4>
              <p class="text-xs text-slate-500 mt-0.5">Você possui modificações não salvas na publicação.</p>
            </div>
          </div>

          <p class="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
            Deseja sair sem salvar as alterações?
          </p>

          <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all min-h-[42px] cursor-pointer"
              @click="confirmLeaveWithoutSaving"
            >
              Sair sem salvar
            </button>
            <button
              type="button"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold transition-all min-h-[42px] cursor-pointer shadow-sm"
              @click="showUnsavedDialog = false"
            >
              Continuar editando
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

