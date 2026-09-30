<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { ServicePublication } from '~/../shared/types/publications'
import type { Service } from '~/../shared/types/services'

const props = defineProps<{ publications: ServicePublication[]; services: Service[]; loading: boolean }>()
const emit = defineEmits<{
  (e: 'edit', publication: ServicePublication): void
  (e: 'saved', publication: ServicePublication): void
}>()
const sourceWorks = computed(() => props.publications
  .filter(p => p.status === 'published' && props.services.some(s => s.id === p.service_id && s.is_active && !s.archived_at))
  .slice().sort((a, b) => a.display_order - b.display_order
    || (b.published_at || '').localeCompare(a.published_at || '') || a.id.localeCompare(b.id)))
const works = ref<ServicePublication[]>([])
const list = ref<HTMLOListElement | null>(null)
const saving = ref(false)
const draggingId = ref<string | null>(null)
const message = ref('')
const failed = ref(false)
const pointer = ref({ x: 0, y: 0 })
let original: ServicePublication[] = []
let pointerId: number | null = null
let frame = 0
let scroller: HTMLElement | null = null
const draggingWork = computed(() => works.value.find(work => work.id === draggingId.value))
watch(sourceWorks, value => { if (!saving.value && !draggingId.value) works.value = [...value] }, { immediate: true })

function move(from: number, to: number) {
  if (from === to || from < 0 || to < 0 || to >= works.value.length) return
  const next = [...works.value]
  const [item] = next.splice(from, 1)
  if (!item) return
  next.splice(to, 0, item)
  works.value = next
}
function updatePosition() {
  if (!list.value || !draggingId.value) return
  const from = works.value.findIndex(work => work.id === draggingId.value)
  const rows = Array.from(list.value.children) as HTMLElement[]
  for (let index = 0; index < rows.length; index++) {
    const rect = rows[index]!.getBoundingClientRect()
    if (pointer.value.y < rect.top || pointer.value.y > rect.bottom) continue
    const midpoint = rect.top + rect.height / 2
    if ((index > from && pointer.value.y > midpoint) || (index < from && pointer.value.y < midpoint)) move(from, index)
    break
  }
}
function autoScroll() {
  if (!draggingId.value) return
  const rect = scroller?.getBoundingClientRect()
  const top = Math.max(rect?.top || 0, 0)
  const bottom = Math.min(rect?.bottom || window.innerHeight, window.innerHeight)
  const y = pointer.value.y
  const speed = y < top + 80 ? -Math.min(18, (top + 80 - y) / 4)
    : y > bottom - 80 ? Math.min(18, (y - bottom + 80) / 4) : 0
  if (speed) {
    if (scroller) scroller.scrollTop += speed
    else window.scrollBy(0, speed)
    updatePosition()
  }
  frame = requestAnimationFrame(autoScroll)
}
function startDrag(event: PointerEvent, work: ServicePublication) {
  if (saving.value || props.loading || draggingId.value || !event.isPrimary || event.button !== 0) return
  original = [...works.value]
  draggingId.value = work.id
  pointerId = event.pointerId
  pointer.value = { x: event.clientX, y: event.clientY }
  message.value = ''
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
  scroller = list.value?.parentElement || null
  while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement
  window.addEventListener('keydown', onEscape)
  frame = requestAnimationFrame(autoScroll)
}
function pointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId || !draggingId.value) return
  event.preventDefault()
  pointer.value = { x: event.clientX, y: event.clientY }
  updatePosition()
}
function clearDrag() {
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onEscape)
  draggingId.value = null
  pointerId = null
}
async function finishDrag(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  clearDrag()
  if (works.value.some((work, index) => work.id !== original[index]?.id)) await saveOrder(original)
}
function cancelDrag() {
  if (!draggingId.value) return
  works.value = [...original]
  clearDrag()
}
function onEscape(event: KeyboardEvent) { if (event.key === 'Escape') cancelDrag() }
async function keyboardMove(event: KeyboardEvent, index: number) {
  if (saving.value || draggingId.value || props.loading) return
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  event.preventDefault()
  const to = index + (event.key === 'ArrowUp' ? -1 : 1)
  if (to < 0 || to >= works.value.length) return
  const previous = [...works.value]
  move(index, to)
  await saveOrder(previous)
}
async function saveOrder(previous: ServicePublication[]) {
  saving.value = true
  failed.value = false
  message.value = 'Salvando ordem...'
  try {
    const updated = await $fetch<ServicePublication[]>('/api/admin/publications/reorder', {
      method: 'PATCH', body: { publication_ids: works.value.map(work => work.id) },
    })
    for (const work of updated) emit('saved', work)
    // Parent props update on the next Vue render; use the saved rows immediately.
    works.value = works.value.map(work => updated.find(item => item.id === work.id) || work)
    message.value = 'Ordem salva!'
  } catch (err: any) {
    works.value = [...previous]
    failed.value = true
    message.value = err?.data?.statusMessage || 'Não foi possível salvar. A ordem anterior foi restaurada. Tente novamente.'
  } finally { saving.value = false }
}
onBeforeUnmount(clearDrag)
</script>

<template>
  <section class="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-6 space-y-4">
    <div>
      <h2 class="text-lg font-bold text-[#09357a]">Trabalhos na home</h2>
      <p id="home-order-help" class="mt-1 text-sm text-slate-600">Arraste pelo ícone ao lado de cada trabalho para mudar a posição, com o mouse ou com o dedo. A ordem é salva ao soltar.</p>
      <p class="mt-2 text-xs text-slate-500">Os seis primeiros aparecem na home. Apenas trabalhos publicados de serviços ativos aparecem nesta lista.</p>
    </div>
    <p v-if="props.loading && !works.length" role="status" class="text-sm text-slate-600">Carregando trabalhos...</p>
    <p v-else-if="!works.length" class="text-sm text-slate-600">Publique um trabalho de um serviço ativo para organizar a home.</p>
    <ol v-else ref="list" class="space-y-3" :aria-busy="saving">
      <li v-for="(work, index) in works" :key="work.id" class="rounded-xl border bg-white p-3 sm:p-4 flex items-center gap-3 transition-colors" :class="[index < 6 ? 'border-blue-200' : 'border-slate-200', draggingId === work.id ? 'ring-2 ring-blue-500 bg-blue-50 opacity-60' : '']">
        <button type="button" :disabled="saving || props.loading" :aria-label="`Arrastar ${work.title}. Use as setas para cima e para baixo no teclado.`" aria-describedby="home-order-help" class="shrink-0 w-11 h-12 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center cursor-grab active:cursor-grabbing disabled:opacity-40 touch-none select-none focus-visible:ring-2 focus-visible:ring-blue-500" @pointerdown="startDrag($event, work)" @pointermove="pointerMove" @pointerup="finishDrag" @pointercancel="cancelDrag" @lostpointercapture="cancelDrag" @keydown="keyboardMove($event, index)">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" aria-hidden="true"><circle cx="6" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="19" r="2"/></svg>
        </button>
        <div class="flex-1 min-w-0 select-none">
          <p class="text-xs font-bold" :class="index < 6 ? 'text-blue-700' : 'text-slate-500'">{{ index < 6 ? 'Aparece na home' : 'Fora dos seis primeiros' }}</p>
          <h3 class="mt-1 text-sm font-bold text-slate-800 break-words">{{ work.title }}</h3>
          <p class="text-xs text-slate-500">{{ services.find(s => s.id === work.service_id)?.name }}</p>
          <button type="button" :disabled="saving || !!draggingId" class="mt-2 min-h-[44px] px-3 rounded-lg border border-slate-200 text-[#09357a] text-xs font-bold disabled:opacity-50 sm:hidden" @click="emit('edit', work)">Fotos, vídeos e capa</button>
        </div>
        <button type="button" :disabled="saving || !!draggingId" class="hidden sm:block shrink-0 min-h-[44px] px-3 rounded-lg border border-slate-200 text-[#09357a] text-xs font-bold disabled:opacity-50" @click="emit('edit', work)">Fotos, vídeos e capa</button>
      </li>
    </ol>
    <p v-if="message" role="status" class="text-sm font-semibold" :class="failed ? 'text-red-700' : 'text-emerald-700'">{{ message }}</p>
    <Teleport to="body">
      <div v-if="draggingWork" aria-hidden="true" class="fixed z-[100] pointer-events-none max-w-[280px] rounded-xl bg-[#09357a] px-4 py-3 text-sm font-bold text-white shadow-xl" :style="{ left: `${Math.max(8, pointer.x - 140)}px`, top: `${pointer.y + 20}px` }">{{ draggingWork.title }}</div>
    </Teleport>
  </section>
</template>
