<script setup lang="ts">
import type { ServicePublication } from '~/../shared/types/publications'

defineProps<{
  publications: ServicePublication[]
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'edit', pub: ServicePublication): void
  (e: 'publish', pub: ServicePublication): void
  (e: 'archive', pub: ServicePublication): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 border-b border-slate-200/80 text-xs uppercase font-bold text-slate-500">
          <tr>
            <th class="px-6 py-4">Trabalho Realizado</th>
            <th class="px-6 py-4">Serviço Vinculado</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Publicado em</th>
            <th class="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="pub in publications" :key="pub.id" class="hover:bg-slate-50/60 transition-colors">
            <td class="px-6 py-4">
              <p class="font-bold text-slate-800">{{ pub.title }}</p>
              <p class="text-xs font-mono text-slate-400">{{ pub.slug }}</p>
            </td>

            <td class="px-6 py-4 font-medium text-slate-700">
              {{ (pub as any).service_name || 'Serviço' }}
            </td>

            <td class="px-6 py-4">
              <span
                v-if="pub.status === 'published'"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                Publicado
              </span>
              <span
                v-else-if="pub.status === 'draft'"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
              >
                Rascunho
              </span>
              <span
                v-else
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"
              >
                Arquivado
              </span>
            </td>

            <td class="px-6 py-4 text-xs text-slate-500">
              {{ pub.published_at ? new Date(pub.published_at).toLocaleDateString('pt-BR') : '-' }}
            </td>

            <td class="px-6 py-4 text-right space-x-2">
              <button
                v-if="pub.status === 'draft'"
                type="button"
                class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                @click="$emit('publish', pub)"
              >
                Publicar
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                @click="$emit('edit', pub)"
              >
                Gerenciar Mídias
              </button>

              <button
                v-if="isAdmin && pub.status !== 'archived'"
                type="button"
                class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                @click="$emit('archive', pub)"
              >
                Arquivar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
