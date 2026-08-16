<script setup lang="ts">
import type { Service } from '~/../shared/types/services'
import { getServiceIconSvg } from '~/utils/serviceIcons'
import MediaPreview from '~/components/media/MediaPreview.vue'

defineProps<{
  services: Service[]
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'edit', service: Service): void
  (e: 'activate', service: Service): void
  (e: 'archive', service: Service): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 border-b border-slate-200/80 text-xs uppercase font-bold text-slate-500">
          <tr>
            <th class="px-6 py-4">Serviço</th>
            <th class="px-6 py-4">Slug</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Destaque Home</th>
            <th class="px-6 py-4">Ordem</th>
            <th class="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="service in services" :key="service.id" class="hover:bg-slate-50/60 transition-colors">
            <!-- Imagem e Nome -->
            <td class="px-6 py-4">
              <div class="flex items-center space-x-3">
                <MediaPreview
                  v-if="(service as any).card_image_url || service.card_image_storage_key"
                  :src="(service as any).card_image_url || service.card_image_storage_key"
                  media-type="image"
                  :alt-text="service.name"
                  size="xs"
                  rounded="md"
                />
                <div v-else class="w-12 h-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path :d="getServiceIconSvg(service.icon_key)"/></svg>
                </div>
                <div>
                  <p class="font-bold text-slate-800">{{ service.name }}</p>
                  <p class="text-xs text-slate-400 line-clamp-1">{{ service.short_description }}</p>
                </div>
              </div>
            </td>

            <!-- Slug -->
            <td class="px-6 py-4 font-mono text-xs text-slate-500">
              {{ service.slug }}
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span
                v-if="service.archived_at"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"
              >
                Arquivado
              </span>
              <span
                v-else-if="service.is_active"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                Ativo
              </span>
              <span
                v-else
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
              >
                Inativo
              </span>
            </td>

            <!-- Destaque Home -->
            <td class="px-6 py-4">
              <span v-if="service.is_featured" class="text-xs font-bold text-blue-600">Sim (Posição: {{ service.home_display_order }})</span>
              <span v-else class="text-xs text-slate-400">Não</span>
            </td>

            <!-- Ordem -->
            <td class="px-6 py-4 text-xs font-mono font-bold">
              {{ service.display_order }}
            </td>

            <!-- Ações -->
            <td class="px-6 py-4 text-right space-x-2">
              <button
                v-if="!service.is_active && !service.archived_at"
                type="button"
                class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                @click="$emit('activate', service)"
              >
                Ativar
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                @click="$emit('edit', service)"
              >
                Editar
              </button>

              <button
                v-if="isAdmin && !service.archived_at"
                type="button"
                class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                @click="$emit('archive', service)"
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
