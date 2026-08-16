<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Service, ServiceIconKey, ServiceAccentVariant } from '~/../shared/types/services'
import { useMediaUpload } from '~/composables/useMediaUpload'
import ServiceCardPreview from './ServiceCardPreview.vue'

const props = defineProps<{
  show: boolean
  service: Service | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: any): void
}>()

const name = ref('')
const slug = ref('')
const shortDescription = ref('')
const description = ref('')
const iconKey = ref<ServiceIconKey>('gate')
const accentVariant = ref<ServiceAccentVariant>('blue')
const isFeatured = ref(false)
const displayOrder = ref(0)
const homeDisplayOrder = ref(0)
const cardImageAlt = ref('')
const previewImageUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const { uploading, uploadServiceCardImage } = useMediaUpload()
const saving = ref(false)
const formError = ref<string | null>(null)

watch(
  () => props.service,
  (s) => {
    name.value = s?.name || ''
    slug.value = s?.slug || ''
    shortDescription.value = s?.short_description || ''
    description.value = s?.description || ''
    iconKey.value = s?.icon_key || 'gate'
    accentVariant.value = s?.accent_variant || 'blue'
    isFeatured.value = s?.is_featured || false
    displayOrder.value = s?.display_order || 0
    homeDisplayOrder.value = s?.home_display_order || 0
    cardImageAlt.value = s?.card_image_alt || ''
    previewImageUrl.value = (s as any)?.card_image_url || s?.card_image_storage_key || null
    selectedFile.value = null
    formError.value = null
  },
  { immediate: true }
)

const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.show) emit('close') }
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    previewImageUrl.value = URL.createObjectURL(target.files[0])
  }
}

function autoSlug() {
  if (!props.service) {
    slug.value = name.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
}

async function handleSubmit() {
  formError.value = null
  saving.value = true
  try {
    emit('save', {
      payload: {
        name: name.value,
        slug: slug.value,
        short_description: shortDescription.value,
        description: description.value,
        icon_key: iconKey.value,
        accent_variant: accentVariant.value,
        is_featured: isFeatured.value,
        display_order: displayOrder.value,
        home_display_order: homeDisplayOrder.value,
      },
      file: selectedFile.value,
      altText: cardImageAlt.value || name.value,
    })
  } catch (err: any) {
    formError.value = err?.message || 'Erro ao salvar serviço.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center space-x-3">
          <button type="button" class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all" @click="$emit('close')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Voltar</span>
          </button>
          <h3 class="text-lg font-bold text-slate-800">{{ service ? 'Editar Serviço' : 'Novo Serviço' }}</h3>
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600 text-2xl font-bold" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Serviço</label>
            <input v-model="name" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" @input="autoSlug" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Slug</label>
            <input v-model="slug" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição Curta (para o Card)</label>
          <input v-model="shortDescription" type="text" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição Completa</label>
          <textarea v-model="description" rows="3" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        </div>

        <!-- Upload de Imagem de Card e Prévia -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2 border-t border-slate-100">
          <div class="space-y-3">
            <label class="block text-xs font-bold uppercase text-slate-500">Imagem do Card</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="text-xs" @change="onFileSelected" />
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Texto Alternativo (Alt Text)</label>
              <input v-model="cardImageAlt" type="text" placeholder="Descreva a imagem para acessibilidade" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
            </div>
          </div>

          <ServiceCardPreview :name="name" :short-description="shortDescription" :image-url="previewImageUrl" :icon-key="iconKey" :accent-variant="accentVariant" />
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button type="button" class="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors" @click="$emit('close')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Voltar / Cancelar</span>
          </button>
          <button type="submit" :disabled="saving || uploading" class="px-6 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-sm font-bold shadow-md disabled:opacity-50 min-h-[42px]">
            {{ saving || uploading ? 'Salvando...' : 'Salvar Serviço' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
