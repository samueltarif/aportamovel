<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ServicePublication } from '~/../shared/types/publications'
import type { Service } from '~/../shared/types/services'

const props = defineProps<{
  publications: ServicePublication[]
  services: Service[]
  loading: boolean
}>()
const emit = defineEmits<{
  (e: 'edit', publication: ServicePublication): void
  (e: 'saved', publication: ServicePublication): void
}>()
const drafts = ref<Record<string, number | string>>({})
const saving = ref<string | null>(null)
const message = ref('')
const failed = ref(false)
const works = computed(() => props.publications
  .filter(p => p.status === 'published' && props.services.some(s => s.id === p.service_id && s.is_active && !s.archived_at))
  .slice()
  .sort((a, b) => a.display_order - b.display_order
    || (b.published_at || '').localeCompare(a.published_at || '')
    || a.id.localeCompare(b.id)))

async function saveOrder(publication: ServicePublication, value: number | string) {
  if (saving.value) return
  const order = Number(value)
  failed.value = false
  if (value === '' || !Number.isInteger(order) || order < -2147483648 || order > 2147483647) {
    failed.value = true
    message.value = 'Informe um número inteiro válido para a ordem.'
    return
  }
  saving.value = publication.id
  message.value = ''
  try {
    const updated = await $fetch<ServicePublication>(`/api/admin/publications/${publication.id}`, {
      method: 'PATCH', body: { display_order: order },
    })
    delete drafts.value[publication.id]
    emit('saved', updated)
    message.value = `Ordem de “${publication.title}” salva na home.`
  } catch (err: any) {
    failed.value = true
    message.value = err?.data?.statusMessage || 'Não foi possível salvar a ordem. Tente novamente.'
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <section class="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-6 space-y-4">
    <div>
      <h2 class="text-lg font-bold text-[#09357a]">Trabalhos na home</h2>
      <p class="mt-1 text-sm text-slate-600">
        Os seis primeiros trabalhos desta lista aparecem na home. Números menores aparecem antes; em caso de empate, o mais recente vem primeiro.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        Em “Fotos, vídeos e capa”, escolha a mídia marcada como Capa para a prévia da home e use as setas para ordenar a galeria do trabalho.
        Apenas trabalhos publicados de serviços ativos aparecem aqui.
      </p>
    </div>
    <p v-if="loading && !works.length" role="status" class="text-sm text-slate-600">Carregando trabalhos...</p>
    <p v-else-if="!works.length" class="text-sm text-slate-600">Publique um trabalho de um serviço ativo para organizar a home.</p>
    <ol v-else class="space-y-3">
      <li v-for="(work, index) in works" :key="work.id" class="rounded-xl border bg-white p-4 flex flex-col lg:flex-row lg:items-center gap-3" :class="index < 6 ? 'border-blue-200' : 'border-slate-200'">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold" :class="index < 6 ? 'text-blue-700' : 'text-slate-500'">{{ index + 1 }}º · {{ index < 6 ? 'Aparece na home' : 'Fora dos seis primeiros' }}</p>
          <h3 class="mt-1 text-sm font-bold text-slate-800 break-words">{{ work.title }}</h3>
          <p class="text-xs text-slate-500">{{ services.find(s => s.id === work.service_id)?.name }}</p>
        </div>
        <form class="flex items-end gap-2 flex-wrap" @submit.prevent="saveOrder(work, drafts[work.id] ?? work.display_order)">
          <label class="text-xs font-semibold text-slate-600">
            Ordem
            <input :value="drafts[work.id] ?? work.display_order" type="number" step="1" min="-2147483648" max="2147483647" required :disabled="!!saving" :aria-label="`Ordem de ${work.title}`" class="block mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 min-h-[44px]" @input="drafts[work.id] = ($event.target as HTMLInputElement).value" />
          </label>
          <button type="submit" :disabled="!!saving" class="min-h-[44px] px-3 rounded-lg bg-[#09357a] text-white text-xs font-bold disabled:opacity-50">{{ saving === work.id ? 'Salvando...' : 'Salvar ordem' }}</button>
          <button type="button" :disabled="!!saving || index === 0" class="min-h-[44px] px-3 rounded-lg bg-slate-100 text-[#09357a] text-xs font-bold disabled:opacity-40" @click="saveOrder(work, (works[0]?.display_order ?? 0) - 1)">Colocar primeiro</button>
          <button type="button" :disabled="!!saving" class="min-h-[44px] px-3 rounded-lg border border-slate-200 text-[#09357a] text-xs font-bold disabled:opacity-50" @click="emit('edit', work)">Fotos, vídeos e capa</button>
        </form>
      </li>
    </ol>
    <p v-if="message" role="status" class="text-sm font-semibold" :class="failed ? 'text-red-700' : 'text-emerald-700'">{{ message }}</p>
  </section>
</template>
