<script setup lang="ts">
import { onMounted } from 'vue'
import PublicationCard from '~/components/services/PublicationCard.vue'
import { usePublicPublications } from '~/composables/usePublicPublications'

const { publications, loading, error, fetchPublications } = usePublicPublications({ home: true })
onMounted(() => fetchPublications())
</script>

<template>
  <section id="trabalhos-realizados" class="scroll-mt-32 py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-left sm:text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-[#09357a] text-xs font-bold uppercase tracking-wider mb-2.5 border border-blue-100">
          <span>Portfólio em Campo</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#09357a] tracking-tight">Trabalhos Realizados</h2>
        <div class="w-16 h-1 bg-[#b91c1c] rounded-full mx-0 sm:mx-auto mt-2.5 mb-3" />
        <p class="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Confira alguns dos trabalhos realizados pela equipe A Portamóvel.
        </p>
      </div>

      <p v-if="loading" role="status" class="py-12 text-center text-slate-600">Carregando trabalhos realizados...</p>
      <div v-else-if="error" class="py-12 text-center">
        <p role="status" class="text-slate-600">{{ error }}</p>
        <button type="button" class="mt-4 px-4 py-3 font-bold text-[#09357a]" @click="fetchPublications()">Tentar novamente</button>
      </div>
      <p v-else-if="!publications.length" class="py-12 text-center text-slate-600">Em breve, novos trabalhos por aqui.</p>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        <PublicationCard v-for="publication in publications" :key="publication.id" :publication="publication" />
      </div>

      <div class="mt-10 text-center">
        <NuxtLink to="/servicos#trabalhos-realizados" class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#09357a] hover:bg-[#07285c] text-white font-bold text-sm transition-colors min-h-[44px]">
          Ver todos os trabalhos
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
