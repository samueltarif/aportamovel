<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminPublications } from '~/composables/useAdminPublications'
import { useAdminServices } from '~/composables/useAdminServices'
import { useAdminState } from '~/composables/useAdminState'
import type { ServicePublication } from '~/../shared/types/publications'
import PublicationsTable from '~/components/admin/publications/PublicationsTable.vue'
import PublicationMobileCard from '~/components/admin/publications/PublicationMobileCard.vue'
import PublicationFormSheet from '~/components/admin/publications/PublicationFormSheet.vue'
import ConfirmArchiveDialog from '~/components/admin/common/ConfirmArchiveDialog.vue'

definePageMeta({
  layout: 'gestao',
  middleware: 'gestao',
})

useHead({
  title: 'Gestão de Publicações e Portfólio - Painel Administrativo',
})

const { adminData } = useAdminState()
const isAdmin = computed(() => adminData.value?.role === 'admin')

const {
  publications,
  currentPublication,
  loading,
  fetchPublications,
  fetchPublicationById,
  createPublication,
  updatePublication,
  publishPublication,
  unpublishPublication,
  archivePublication,
  deletePublication,
} = useAdminPublications()

const { services, fetchServices } = useAdminServices()

const isSheetOpen = ref(false)
const selectedPub = ref<any | null>(null)
const isArchiveDialogOpen = ref(false)
const pubToArchive = ref<ServicePublication | null>(null)

const isDeleteDialogOpen = ref(false)
const pubToDelete = ref<ServicePublication | null>(null)

const toastMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

function showToast(text: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = { type, text }
  setTimeout(() => {
    if (toastMessage.value?.text === text) toastMessage.value = null
  }, 4000)
}

onMounted(async () => {
  await Promise.all([fetchPublications(), fetchServices()])
})

function openNewSheet() {
  selectedPub.value = null
  currentPublication.value = null
  isSheetOpen.value = true
}

async function openEditSheet(pub: ServicePublication) {
  selectedPub.value = pub
  await fetchPublicationById(pub.id)
  isSheetOpen.value = true
}

async function handleSaveInfo(payload: any) {
  try {
    if (selectedPub.value) {
      await updatePublication(selectedPub.value.id, payload)
      await fetchPublicationById(selectedPub.value.id)
      showToast('Publicação salva em rascunho!')
    } else {
      const created = await createPublication(payload)
      selectedPub.value = created
      await fetchPublicationById(created.id)
      showToast('Publicação salva em rascunho!')
    }
    await fetchPublications()
  } catch (err: any) {
    showToast(err?.message || 'Erro ao salvar publicação.', 'error')
  }
}

async function handleRefreshDetail(pubId: string) {
  await fetchPublicationById(pubId)
  await fetchPublications()
  showToast('Galeria de mídias atualizada!')
}

async function handlePublish(pub: ServicePublication) {
  try {
    await publishPublication(pub.id)
    await fetchPublications()
    showToast('Publicação publicada no site com sucesso!')
  } catch (err: any) {
    showToast(err?.message || 'Não foi possível publicar. Verifique se há mídias e 1 capa.', 'error')
  }
}

async function handleUnpublish(pub: ServicePublication) {
  try {
    await unpublishPublication(pub.id)
    await fetchPublications()
    showToast('Publicação ocultada do site com sucesso!')
  } catch (err: any) {
    showToast(err?.message || 'Erro ao ocultar publicação.', 'error')
  }
}

function openArchiveDialog(pub: ServicePublication) {
  pubToArchive.value = pub
  isArchiveDialogOpen.value = true
}

async function handleConfirmArchive() {
  if (!pubToArchive.value) return
  try {
    await archivePublication(pubToArchive.value.id, true)
    isArchiveDialogOpen.value = false
    pubToArchive.value = null
    await fetchPublications()
    showToast('Publicação arquivada com sucesso!')
  } catch (err: any) {
    showToast(err?.message || 'Erro ao arquivar publicação.', 'error')
  }
}

function openDeleteDialog(pub: ServicePublication) {
  pubToDelete.value = pub
  isDeleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!pubToDelete.value) return
  try {
    await deletePublication(pubToDelete.value.id)
    isDeleteDialogOpen.value = false
    pubToDelete.value = null
    await fetchPublications()
    showToast('Publicação excluída com sucesso!')
  } catch (err: any) {
    showToast(err?.message || 'Erro ao excluir publicação.', 'error')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Toast Global -->
    <div
      v-if="toastMessage"
      class="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-bold transition-all animate-in slide-in-from-bottom-2"
      :class="toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'"
    >
      <svg v-if="toastMessage.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
      <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
      <span>{{ toastMessage.text }}</span>
    </div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Trabalhos &amp; Portfólio</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Gerencie publicações de casos reais, fotos e vídeos de antes/depois hospedados com segurança no R2.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
        @click="openNewSheet"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>Nova Publicação</span>
      </button>
    </div>

    <div v-if="loading && publications.length === 0" class="py-16 text-center">
      <div class="inline-block w-8 h-8 border-4 border-[#09357a] border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else>
      <div class="hidden md:block">
        <PublicationsTable
          :publications="publications"
          :is-admin="isAdmin"
          @edit="openEditSheet"
          @publish="handlePublish"
          @unpublish="handleUnpublish"
          @delete="openDeleteDialog"
          @archive="openArchiveDialog"
        />
      </div>

      <div class="md:hidden space-y-3">
        <PublicationMobileCard
          v-for="p in publications"
          :key="p.id"
          :publication="p"
          :is-admin="isAdmin"
          @edit="openEditSheet"
          @publish="handlePublish"
          @unpublish="handleUnpublish"
          @delete="openDeleteDialog"
          @archive="openArchiveDialog"
        />
      </div>
    </div>

    <PublicationFormSheet
      :show="isSheetOpen"
      :publication="currentPublication"
      :services="services"
      @close="isSheetOpen = false"
      @save-info="handleSaveInfo"
      @refresh-detail="handleRefreshDetail"
    />

    <!-- Diálogo de Confirmação para Arquivar -->
    <ConfirmArchiveDialog
      :show="isArchiveDialogOpen"
      title="Arquivar Publicação"
      :message="`Tem certeza que deseja arquivar a publicação '${pubToArchive?.title}'?`"
      @confirm="handleConfirmArchive"
      @cancel="isArchiveDialogOpen = false"
    />

    <!-- Diálogo de Confirmação para Excluir Definitivamente -->
    <ConfirmArchiveDialog
      :show="isDeleteDialogOpen"
      title="Excluir Publicação Definitivamente"
      :message="`Tem certeza que deseja excluir a publicação '${pubToDelete?.title}' e todas as suas mídias associadas? Esta ação não pode ser desfeita.`"
      @confirm="handleConfirmDelete"
      @cancel="isDeleteDialogOpen = false"
    />
  </div>
</template>
