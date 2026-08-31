<script setup lang="ts">
import { ArrowUp, ArrowDown, Edit2, Trash2, Power, Eye, EyeOff } from '@lucide/vue'
import type { AdminHeroSlideItem } from '~/../shared/types/heroSlides'

defineProps<{
  slides: AdminHeroSlideItem[]
  loading?: boolean
  actionLoading?: boolean
}>()

defineEmits<{
  (e: 'move-up', index: number): void
  (e: 'move-down', index: number): void
  (e: 'toggle-active', slide: AdminHeroSlideItem): void
  (e: 'edit-title', slide: AdminHeroSlideItem): void
  (e: 'delete-slide', slide: AdminHeroSlideItem): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
    <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 class="font-bold text-sm text-slate-800">Fotos no Carrossel</h3>
        <p class="text-xs text-slate-500 mt-0.5">Ordem de exibição e controle de visibilidade dos slides.</p>
      </div>
      <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
        {{ slides.length }} foto(s)
      </span>
    </div>

    <div v-if="slides.length === 0" class="p-12 text-center text-slate-400 space-y-2">
      <p class="text-xs font-semibold">Nenhuma foto adicionada ao Hero ainda.</p>
      <p class="text-[11px] text-slate-500">Clique em "+ Adicionar fotos" para escolher fotos dos serviços realizados.</p>
    </div>

    <div v-else class="divide-y divide-slate-100">
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-50/70"
        :class="{ 'opacity-60 bg-slate-50/40': !slide.is_active }"
      >
        <!-- Info da Foto e Categoria -->
        <div class="flex items-center space-x-3.5 min-w-0">
          <div class="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
            <img
              :src="slide.image_url"
              :alt="slide.alt_text || slide.effective_title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span class="absolute bottom-0 right-0 px-1 rounded-tl-sm bg-black/70 text-[9px] font-bold text-white font-mono">
              #{{ index + 1 }}
            </span>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-xs text-slate-900 truncate">
                {{ slide.effective_title }}
              </span>
              <span
                v-if="slide.title_override"
                class="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800"
                title="Título personalizado pelo administrador"
              >
                Personalizado
              </span>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase"
                :class="slide.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'"
              >
                {{ slide.is_active ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <p class="text-[11px] text-slate-500 truncate mt-0.5">
              Publicação: <strong class="text-slate-700 font-medium">{{ slide.publication_title }}</strong>
            </p>
          </div>
        </div>

        <!-- Ações do Slide -->
        <div class="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <!-- Reordenar para Cima -->
          <button
            type="button"
            :disabled="index === 0 || actionLoading"
            class="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20 transition-all cursor-pointer"
            title="Mover para cima"
            @click="$emit('move-up', index)"
          >
            <ArrowUp class="w-4 h-4" />
          </button>

          <!-- Reordenar para Baixo -->
          <button
            type="button"
            :disabled="index === slides.length - 1 || actionLoading"
            class="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20 transition-all cursor-pointer"
            title="Mover para baixo"
            @click="$emit('move-down', index)"
          >
            <ArrowDown class="w-4 h-4" />
          </button>

          <!-- Editar Título -->
          <button
            type="button"
            :disabled="actionLoading"
            class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Personalizar título"
            @click="$emit('edit-title', slide)"
          >
            <Edit2 class="w-4 h-4" />
          </button>

          <!-- Alternar Ativo/Inativo -->
          <button
            type="button"
            :disabled="actionLoading"
            class="p-2 rounded-lg transition-colors cursor-pointer"
            :class="slide.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'"
            :title="slide.is_active ? 'Desativar do carrossel' : 'Ativar no carrossel'"
            @click="$emit('toggle-active', slide)"
          >
            <component :is="slide.is_active ? Eye : EyeOff" class="w-4 h-4" />
          </button>

          <!-- Remover do Hero -->
          <button
            type="button"
            :disabled="actionLoading"
            class="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            title="Remover do Hero"
            @click="$emit('delete-slide', slide)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
