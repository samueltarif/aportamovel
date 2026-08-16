<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
import EmergencyBanner from '~/components/EmergencyBanner.vue'
import EmergencyModal from '~/components/EmergencyModal.vue'
import QuoteModal from '~/components/QuoteModal.vue'
import BeforeAfterViewer from '~/components/services/BeforeAfterViewer.vue'
import type { PublicPublicationDetail } from '~/../shared/types/publications'

const route = useRoute()
const serviceSlug = String(route.params.serviceSlug)
const publicationSlug = String(route.params.publicationSlug)

const publication = ref<PublicPublicationDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const isEmergencyOpen = ref(false)
const isQuoteOpen = ref(false)

useHead(() => ({
  title: publication.value ? `${publication.value.title} - A Portamóvel` : 'Trabalho Realizado - A Portamóvel',
  meta: [
    {
      name: 'description',
      content: publication.value?.summary || 'Conheça em detalhes este caso de manutenção executado pela A Portamóvel.',
    },
  ],
}))

onMounted(async () => {
  try {
    const data = await $fetch<PublicPublicationDetail>(
      `/api/public/services/${serviceSlug}/publications/${publicationSlug}`
    )
    publication.value = data
  } catch (err: any) {
    console.error('[PublicationDetail] Erro ao carregar trabalho:', err)
    error.value = 'Trabalho realizado não encontrado ou indisponível.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-gray-900 antialiased">
    <!-- Header -->
    <AppHeader @open-emergency="isEmergencyOpen = true" />

    <!-- Conteúdo Principal -->
    <main class="py-12 md:py-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <!-- Breadcrumb de Navegação -->
        <nav class="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <NuxtLink to="/" class="hover:text-[#09357a]">Início</NuxtLink>
          <span>/</span>
          <NuxtLink to="/servicos" class="hover:text-[#09357a]">Serviços</NuxtLink>
          <span>/</span>
          <NuxtLink :to="`/servicos?categoria=${serviceSlug}#trabalhos-realizados`" class="hover:text-[#09357a] text-blue-600">
            {{ publication?.service_name || 'Categoria' }}
          </NuxtLink>
        </nav>

        <!-- Estado de Carregamento -->
        <div v-if="loading" class="py-20 text-center">
          <div class="inline-block w-10 h-10 border-4 border-[#09357a] border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Estado de Erro / Não Encontrado -->
        <div v-else-if="error || !publication" class="py-16 text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-lg mx-auto">
          <h2 class="text-xl font-bold text-slate-800">Trabalho não encontrado</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-2">{{ error }}</p>
          <NuxtLink to="/servicos" class="inline-block mt-6 px-6 py-2.5 rounded-xl bg-[#09357a] text-white text-xs font-bold uppercase">
            Voltar aos Serviços
          </NuxtLink>
        </div>

        <!-- Detalhes do Trabalho -->
        <article v-else class="space-y-8">
          <!-- Cabeçalho -->
          <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-4">
            <span class="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#09357a] text-xs font-bold uppercase border border-blue-100">
              {{ publication.service_name }}
            </span>
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#09357a] tracking-tight leading-snug">
              {{ publication.title }}
            </h1>
            <p class="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              {{ publication.summary }}
            </p>
          </div>

          <!-- Visualizador Antes & Depois / Galeria de Mídias -->
          <BeforeAfterViewer
            v-if="publication.medias && publication.medias.length > 0"
            :medias="publication.medias"
            :title="publication.title"
          />

          <!-- Descrição Detalhada da Obra -->
          <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-4">
            <h3 class="text-lg font-bold text-[#09357a] uppercase tracking-wider">
              Sobre a Execução do Projeto
            </h3>
            <div class="w-12 h-1 bg-gradient-to-r from-[#09357a] to-[#b91c1c] rounded-full" />
            <p class="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {{ publication.description }}
            </p>

            <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p class="text-xs text-slate-400">Gostaria de um orçamento semelhante para seu condomínio?</p>
                <p class="text-sm font-bold text-slate-800">Fale com nossos especialistas agora mesmo.</p>
              </div>
              <button
                type="button"
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md min-h-[44px]"
                @click="isQuoteOpen = true"
              >
                Solicitar Orçamento Deste Serviço
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Emergency Banner & Footer -->
    <EmergencyBanner text="ATENDIMENTO DE EMERGÊNCIA EM ATÉ 6 HORAS" />
    <AppFooter />

    <!-- Modals -->
    <EmergencyModal :is-open="isEmergencyOpen" @close="isEmergencyOpen = false" />
    <QuoteModal :is-open="isQuoteOpen" :service-name="publication?.service_name || 'Serviço Especializado'" @close="isQuoteOpen = false" />
  </div>
</template>
