<script setup lang="ts">
import type { SectionStatus, TopPageItem } from '~~/shared/types/adminAnalytics'

defineProps<{
  pages: TopPageItem[]
  status: SectionStatus
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Páginas Mais Acessadas</h3>
          <p class="text-xs text-slate-500 mt-0.5">Rotas com maior volume de visualizações no período.</p>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="status === 'loading'" class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-8 w-full bg-slate-100/80 animate-pulse rounded-md" />
      </div>

      <!-- Erro ou Indisponível -->
      <div v-else-if="status === 'error' || status === 'unavailable'" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Dados de páginas temporariamente indisponíveis.</p>
      </div>

      <!-- Vazio -->
      <div v-else-if="!pages.length" class="py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p class="text-xs text-slate-500 font-medium">Nenhum acesso registrado no período.</p>
      </div>

      <!-- Tabela de Páginas -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th class="pb-2">Página</th>
              <th class="pb-2 text-right">Visualizações</th>
              <th class="pb-2 text-right">Visitantes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in pages" :key="p.path" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-2.5 font-mono text-slate-700 font-medium truncate max-w-[180px] sm:max-w-none">
                {{ p.path }}
              </td>
              <td class="py-2.5 text-right font-bold text-slate-900">
                {{ p.pageviews }}
              </td>
              <td class="py-2.5 text-right text-slate-500 font-medium">
                {{ p.uniqueVisitors }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
