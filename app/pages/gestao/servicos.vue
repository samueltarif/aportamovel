<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminServices } from '~/composables/useAdminServices'
import { useMediaUpload } from '~/composables/useMediaUpload'
import { useAdminState } from '~/composables/useAdminState'
import type { Service } from '~/../shared/types/services'
import ServicesTable from '~/components/admin/services/ServicesTable.vue'
import ServiceMobileCard from '~/components/admin/services/ServiceMobileCard.vue'
import ServiceFormModal from '~/components/admin/services/ServiceFormModal.vue'
import ConfirmArchiveDialog from '~/components/admin/common/ConfirmArchiveDialog.vue'

definePageMeta({
  layout: 'gestao',
  middleware: 'gestao',
})

useHead({
  title: 'Gestão de Serviços - Painel Administrativo',
})

const { adminData } = useAdminState()
const isAdmin = computed(() => adminData.value?.role === 'admin')

const { services, loading, fetchServices, createService, updateService, activateService, archiveService } = useAdminServices()
const { uploadServiceCardImage } = useMediaUpload()

const isModalOpen = ref(false)
const selectedService = ref<Service | null>(null)
const isArchiveDialogOpen = ref(false)
const serviceToArchive = ref<Service | null>(null)

onMounted(() => {
  fetchServices()
})

function openNewModal() {
  selectedService.value = null
  isModalOpen.value = true
}

function openEditModal(service: Service) {
  selectedService.value = service
  isModalOpen.value = true
}

async function handleSaveService(eventData: { payload: any; file: File | null; altText: string }) {
  try {
    let savedService: Service

    if (selectedService.value) {
      savedService = await updateService(selectedService.value.id, eventData.payload)
    } else {
      savedService = await createService(eventData.payload)
    }

    if (eventData.file) {
      await uploadServiceCardImage(savedService.id, eventData.file, eventData.altText)
      await fetchServices()
    }

    isModalOpen.value = false
  } catch (err: any) {
    alert(err?.message || 'Erro ao salvar serviço.')
  }
}

async function handleActivateService(service: Service) {
  try {
    await activateService(service.id)
  } catch (err: any) {
    alert(err?.message || 'Não foi possível ativar o serviço.')
  }
}

function openArchiveDialog(service: Service) {
  serviceToArchive.value = service
  isArchiveDialogOpen.value = true
}

async function handleConfirmArchive() {
  if (!serviceToArchive.value) return
  try {
    await archiveService(serviceToArchive.value.id, true)
    isArchiveDialogOpen.value = false
    serviceToArchive.value = null
  } catch (err: any) {
    alert(err?.message || 'Erro ao arquivar serviço.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Gestão de Serviços</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Cadastre, edite, altere imagens de card e controle quais serviços são exibidos no catálogo público.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
        @click="openNewModal"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>Novo Serviço</span>
      </button>
    </div>

    <div v-if="loading && services.length === 0" class="py-16 text-center">
      <div class="inline-block w-8 h-8 border-4 border-[#09357a] border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else>
      <div class="hidden md:block">
        <ServicesTable
          :services="services"
          :is-admin="isAdmin"
          @edit="openEditModal"
          @activate="handleActivateService"
          @archive="openArchiveDialog"
        />
      </div>

      <div class="md:hidden space-y-3">
        <ServiceMobileCard
          v-for="s in services"
          :key="s.id"
          :service="s"
          :is-admin="isAdmin"
          @edit="openEditModal"
          @activate="handleActivateService"
          @archive="openArchiveDialog"
        />
      </div>
    </div>

    <ServiceFormModal
      :show="isModalOpen"
      :service="selectedService"
      @close="isModalOpen = false"
      @save="handleSaveService"
    />

    <ConfirmArchiveDialog
      :show="isArchiveDialogOpen"
      title="Arquivar Serviço"
      :message="`Tem certeza que deseja arquivar o serviço '${serviceToArchive?.name}'? Ele não será mais exibido no catálogo público.`"
      @confirm="handleConfirmArchive"
      @cancel="isArchiveDialogOpen = false"
    />
  </div>
</template>
