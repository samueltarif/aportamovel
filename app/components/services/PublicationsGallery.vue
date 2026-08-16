<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublicPublications } from '~/composables/usePublicPublications'
import type { PublicServiceItem } from '~/../shared/types/services'
import PublicationCard from './PublicationCard.vue'

const props = defineProps<{
  services: PublicServiceItem[]
}>()

const route = useRoute()
const router = useRouter()
const {
  publications,
  loading,
  loadingMore,
  error,
  hasNext,
  currentServiceSlug,
  fetchPublications,
  loadMore,
} = usePublicPublications()

// Filtros disponíveis: "Todos" + serviços com trabalhos publicados
const availableFilters = computed(() => {
  const publishedServices = props.services.filter((s) => s.has_publications)
  return [
    { slug: 'all', name: 'Todos os Trabalhos' },
    ...publishedServices.map((s) => ({ slug: s.slug, name: s.name })),
  ]
})

function selectCategory(slug: string) {
  currentServiceSlug.value = slug
  router.replace({
    path: route.path,
    query: slug !== 'all' ? { categoria: slug } : {},
    hash: '#trabalhos-realizados',
  })
  fetchPublications(slug, true)
}

onMounted(() => {
  const initialCategory = route.query.categoria ? String(route.query.categoria) : 'all'
  fetchPublications(initialCategory, true)
})

watch(
  () => route.query.categoria,
  (newCat) => {
    const slug = newCat ? String(newCat) : 'all'
    if (slug !== currentServiceSlug.value) {
      fetchPublications(slug, true)
    }
  }
)
</script>

<template>
  <section id="trabalhos-realizados" class="py-16 md:py-24 bg-slate-50 border-t border-slate-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Cabeçalho da Seção -->
      <div class="text-center max-w-3xl mx-auto mb-10">
        <span class="inline-block bg-blue-50 text-[#09357a] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-blue-100">
          Portfólio &amp; Casos Reais
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-[#09357a] tracking-tight">
          Trabalhos Realizados
        </h2>
        <div class="w-16 h-1 bg-gradient-to-r from-[#09357a] to-[#b91c1c] rounded-full mx-auto mt-3 mb-4" />
        <p class="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
          Veja exemplos reais de manutenções, reformas estruturais e soluções executadas pela equipe A Portamóvel.
        </p>
      </div>

      <!-- Barra de Filtros por Categoria -->
      <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar justify-start sm:justify-center">
        <button
          v-for="filter in availableFilters"
          :key="filter.slug"
          type="button"
          :class="[
            'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-1.5 border min-h-[44px]',
            currentServiceSlug === filter.slug
              ? 'bg-[#09357a] text-white border-[#09357a] shadow-md scale-105'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          ]"
          @click="selectCategory(filter.slug)"
        >
          <span>{{ filter.name }}</span>
        </button>
      </div>

      <!-- Estado de Carregamento Inicial -->
      <div v-if="loading" class="py-16 text-center">
        <div class="inline-block w-8 h-8 border-4 border-[#09357a] border-t-transparent rounded-full animate-spin" />
        <p class="mt-3 text-sm text-slate-600 font-medium">Carregando trabalhos realizados...</p>
      </div>

      <!-- Estado Vazio -->
      <div v-else-if="publications.length === 0" class="py-16 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto p-8 shadow-xs">
        <svg class="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <h4 class="text-base font-bold text-slate-800">Nenhum trabalho encontrado</h4>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Ainda não há publicações para a categoria selecionada.</p>
      </div>

      <!-- Grid de Publicações (3 colunas desktop) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        <PublicationCard
          v-for="pub in publications"
          :key="pub.id"
          :publication="pub"
        />
      </div>

      <!-- Botão Carregar Mais -->
      <div v-if="hasNext && !loading" class="mt-12 text-center">
        <button
          type="button"
          :disabled="loadingMore"
          class="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#09357a] font-bold text-sm border border-slate-300 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 min-h-[44px]"
          @click="loadMore"
        >
          <span v-if="loadingMore">Carregando...</span>
          <span v-else>Carregar Mais Trabalhos</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
