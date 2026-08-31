<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, RotateCw, CheckCircle2, AlertCircle } from '@lucide/vue'
import { useAdminHeroSlides } from '~/composables/useAdminHeroSlides'
import { useAdminServices } from '~/composables/useAdminServices'
import type { AdminHeroSlideItem } from '~/../shared/types/heroSlides'
import HeroLivePreview from '~/components/admin/hero/HeroLivePreview.vue'
import HeroSlidesTable from '~/components/admin/hero/HeroSlidesTable.vue'
import HeroMediaPickerModal from '~/components/admin/hero/HeroMediaPickerModal.vue'
import HeroTitleModal from '~/components/admin/hero/HeroTitleModal.vue'
import ConfirmArchiveDialog from '~/components/admin/common/ConfirmArchiveDialog.vue'

definePageMeta({ layout: 'gestao', middleware: ['gestao'] })
useHead({ title: 'Carrossel da Home - Painel Administrativo | A Portamóvel' })

const {
  slides, loading, actionLoading, availableMedia, mediaLoading, pagination, error,
  fetchHeroSlides, fetchAvailableMedia, addSlide, updateSlide, deleteSlide, moveSlide,
} = useAdminHeroSlides()

const { services, fetchServices } = useAdminServices()

const isPickerOpen = ref(false)
const isTitleModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedSlide = ref<AdminHeroSlideItem | null>(null)
const feedback = ref<{ text: string; type: 'success' | 'error' } | null>(null)

function showToast(text: string, type: 'success' | 'error' = 'success') {
  feedback.value = { text, type }
  setTimeout(() => { if (feedback.value?.text === text) feedback.value = null }, 4000)
}

onMounted(async () => {
  await Promise.all([fetchHeroSlides(), fetchServices()])
})

function openPicker() {
  isPickerOpen.value = true
}

async function handleSelectMedia(mediaId: string) {
  try {
    await addSlide(mediaId)
    isPickerOpen.value = false
    showToast('Foto adicionada ao carrossel com sucesso!')
  } catch (err: any) {
    showToast(err?.message || 'Erro ao adicionar foto.', 'error')
  }
}

function handleFilterMedia(params: any) {
  fetchAvailableMedia(params)
}

async function handleMoveUp(index: number) {
  try {
    await moveSlide(index, index - 1)
  } catch {
    showToast('Erro ao reordenar slide.', 'error')
  }
}

async function handleMoveDown(index: number) {
  try {
    await moveSlide(index, index + 1)
  } catch {
    showToast('Erro ao reordenar slide.', 'error')
  }
}

async function handleToggleActive(slide: AdminHeroSlideItem) {
  try {
    await updateSlide(slide.id, { is_active: !slide.is_active })
    showToast(`Slide ${!slide.is_active ? 'ativado' : 'desativado'} com sucesso!`)
  } catch {
    showToast('Erro ao alterar visibilidade do slide.', 'error')
  }
}

function handleEditTitle(slide: AdminHeroSlideItem) {
  selectedSlide.value = slide
  isTitleModalOpen.value = true
}

async function handleSaveTitle(override: string | null) {
  if (!selectedSlide.value) return
  try {
    await updateSlide(selectedSlide.value.id, { title_override: override })
    isTitleModalOpen.value = false
    showToast('Título do slide atualizado com sucesso!')
  } catch {
    showToast('Erro ao salvar título.', 'error')
  }
}

function handleDeleteSlide(slide: AdminHeroSlideItem) {
  selectedSlide.value = slide
  isDeleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!selectedSlide.value) return
  try {
    await deleteSlide(selectedSlide.value.id)
    isDeleteDialogOpen.value = false
    selectedSlide.value = null
    showToast('Foto removida do carrossel do Hero.')
  } catch {
    showToast('Erro ao remover slide.', 'error')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Toast Global -->
    <div
      v-if="feedback"
      class="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-bold transition-all"
      :class="feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'"
    >
      <CheckCircle2 v-if="feedback.type === 'success'" class="w-5 h-5 shrink-0" />
      <AlertCircle v-else class="w-5 h-5 shrink-0" />
      <span>{{ feedback.text }}</span>
    </div>

    <!-- Header Principal -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Carrossel da Home</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Escolha e organize quais fotos de serviços aparecem no destaque principal do site.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors"
          title="Atualizar lista"
          @click="fetchHeroSlides"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>

        <button
          type="button"
          class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          @click="openPicker"
        >
          <Plus class="w-4 h-4" />
          <span>Adicionar fotos</span>
        </button>
      </div>
    </div>

    <!-- Grid de Prévia e Gerenciamento -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-5">
        <HeroLivePreview :slides="slides" />
      </div>

      <div class="lg:col-span-7">
        <HeroSlidesTable
          :slides="slides"
          :loading="loading"
          :action-loading="actionLoading"
          @move-up="handleMoveUp"
          @move-down="handleMoveDown"
          @toggle-active="handleToggleActive"
          @edit-title="handleEditTitle"
          @delete-slide="handleDeleteSlide"
        />
      </div>
    </div>

    <!-- Modais -->
    <HeroMediaPickerModal
      :show="isPickerOpen"
      :available-media="availableMedia"
      :services="services"
      :media-loading="mediaLoading"
      :action-loading="actionLoading"
      :pagination="pagination"
      @close="isPickerOpen = false"
      @select="handleSelectMedia"
      @filter="handleFilterMedia"
    />

    <HeroTitleModal
      :show="isTitleModalOpen"
      :slide="selectedSlide"
      :loading="actionLoading"
      @close="isTitleModalOpen = false"
      @save="handleSaveTitle"
    />

    <ConfirmArchiveDialog
      :show="isDeleteDialogOpen"
      title="Remover foto do Carrossel"
      :message="`Deseja remover esta foto do carrossel do Hero? (A foto continuará salva na sua respectiva publicação no portfólio).`"
      @confirm="handleConfirmDelete"
      @cancel="isDeleteDialogOpen = false"
    />
  </div>
</template>
