<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Search, ChevronLeft, ChevronRight, Plus, Loader2, Image as ImageIcon } from '@lucide/vue'
import type { AvailableHeroMedia } from '~/../shared/types/heroSlides'
import type { Service } from '~/../shared/types/services'

const props = defineProps<{
  show: boolean
  availableMedia: AvailableHeroMedia[]
  services: Service[]
  mediaLoading?: boolean
  actionLoading?: boolean
  pagination: { page: number; limit: number; total: number; total_pages: number }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', mediaId: string): void
  (e: 'filter', params: { serviceId?: string; search?: string; page?: number }): void
}>()

const selectedServiceId = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)

watch(
  () => props.show,
  (open) => {
    if (open) {
      selectedServiceId.value = 'all'
      searchQuery.value = ''
      currentPage.value = 1
      applyFilter()
    }
  }
)

function applyFilter() {
  emit('filter', {
    serviceId: selectedServiceId.value !== 'all' ? selectedServiceId.value : undefined,
    search: searchQuery.value.trim() || undefined,
    page: currentPage.value,
  })
}

function handleServiceChange() {
  currentPage.value = 1
  applyFilter()
}

function handleSearch() {
  currentPage.value = 1
  applyFilter()
}

function changePage(delta: number) {
  const next = currentPage.value + delta
  if (next >= 1 && next <= props.pagination.total_pages) {
    currentPage.value = next
    applyFilter()
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Selecionar Fotos do Portfólio</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Escolha fotos reais já cadastradas nos trabalhos realizados da serralheria.</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          @click="$emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Filtros -->
      <div class="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 shrink-0">
        <div class="sm:w-1/3">
          <select
            v-model="selectedServiceId"
            class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#09357a]"
            @change="handleServiceChange"
          >
            <option value="all">Todos os serviços</option>
            <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por publicação ou descrição..."
            class="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#09357a] outline-none"
            @keydown.enter.prevent="handleSearch"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <!-- Grid de Mídias -->
      <div class="flex-1 overflow-y-auto p-4 min-h-[300px]">
        <div v-if="mediaLoading" class="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 class="w-7 h-7 animate-spin text-[#09357a]" />
          <span class="text-xs font-semibold">Carregando fotos disponíveis...</span>
        </div>

        <div v-else-if="availableMedia.length === 0" class="py-16 text-center text-slate-400 space-y-2">
          <ImageIcon class="w-8 h-8 mx-auto opacity-40" />
          <p class="text-xs font-semibold">Nenhuma foto disponível encontrada com os filtros selecionados.</p>
          <p class="text-[11px] text-slate-500">Cadastre novas publicações com fotos em "Trabalhos &amp; Portfólio" para selecioná-las aqui.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div
            v-for="item in availableMedia"
            :key="item.id"
            class="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-2xs hover:border-[#09357a]/40 hover:shadow-xs transition-all"
          >
            <div class="aspect-4/3 w-full bg-slate-100 relative overflow-hidden">
              <img
                :src="item.image_url"
                :alt="item.alt_text || item.service_name"
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold uppercase backdrop-blur-xs">
                {{ item.service_name }}
              </span>
            </div>

            <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 class="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">{{ item.publication_title }}</h4>
                <p v-if="item.alt_text" class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ item.alt_text }}</p>
              </div>

              <button
                type="button"
                :disabled="actionLoading"
                class="w-full py-2 px-3 rounded-lg bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                @click="$emit('select', item.id)"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Adicionar ao Hero</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação no Rodapé -->
      <div class="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600 shrink-0">
        <span>Total: <strong>{{ pagination.total }}</strong> fotos encontradas</span>
        <div v-if="pagination.total_pages > 1" class="flex items-center gap-2">
          <button
            type="button"
            :disabled="pagination.page <= 1 || mediaLoading"
            class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            @click="changePage(-1)"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-[11px] font-semibold">{{ pagination.page }} de {{ pagination.total_pages }}</span>
          <button
            type="button"
            :disabled="pagination.page >= pagination.total_pages || mediaLoading"
            class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            @click="changePage(1)"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
