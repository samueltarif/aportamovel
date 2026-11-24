<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RotateCw, Search, X } from '@lucide/vue'
import type { WhatsAppClick, WhatsAppClickListResponse, WhatsAppClickStatus } from '~~/shared/types/whatsappClicks'

definePageMeta({ layout: 'gestao', middleware: 'gestao' })
useHead({ title: 'Cliques no WhatsApp - A Portamóvel' })

type Period = '7' | '30' | '90' | 'all'
type StatusFilter = 'all' | WhatsAppClickStatus
const periods: { id: Period, label: string }[] = [
  { id: '7', label: '7 dias' }, { id: '30', label: '30 dias' }, { id: '90', label: '90 dias' }, { id: 'all', label: 'Tudo' },
]
const statusTabs: { id: StatusFilter, label: string }[] = [
  { id: 'pending', label: 'Aguardando' }, { id: 'identified', label: 'Identificados' }, { id: 'ignored', label: 'Sem conversa' }, { id: 'all', label: 'Todos' },
]

const period = ref<Period>('30')
const status = ref<StatusFilter>('pending')
const code = ref('')
const data = ref<WhatsAppClickListResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const typed = code.value.trim().toUpperCase().replace(/\s/g, '')
    data.value = await $fetch<WhatsAppClickListResponse>('/api/admin/whatsapp-clicks', {
      params: { period: period.value, status: status.value, ...(typed ? { code: typed } : {}) },
    })
  }
  catch (err: any) {
    error.value = err?.data?.message || 'Erro ao carregar os cliques.'
  }
  finally {
    loading.value = false
  }
}
onMounted(load)
watch([period, status], load)
let timer: ReturnType<typeof setTimeout> | undefined
watch(code, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 350)
})

const s = computed(() => data.value?.summary)
const kpis = computed(() => [
  { label: 'Cliques no WhatsApp', value: s.value?.total ?? '…', hint: 'no período' },
  { label: 'Aguardando', value: s.value?.pending ?? '…', hint: 'código ainda não identificado' },
  { label: 'Identificados', value: s.value?.identified ?? '…', hint: s.value?.total ? `${Math.round((s.value.identified / s.value.total) * 100)}% dos cliques` : 'viraram lead' },
  { label: 'Vindos do anúncio', value: s.value?.fromAds ?? '…', hint: 'com clique do Google Ads' },
])

const CTA_LABEL: Record<string, string> = {
  floating_button: 'Botão flutuante', top_bar: 'Barra do topo', footer: 'Rodapé', header: 'Cabeçalho',
  quote_modal: 'Modal de orçamento', contact_form: 'Formulário de contato', contact_page: 'Página de contato',
  emergency_modal: 'Emergência', service_card: 'Card de serviço', services_section: 'Seção de serviços',
  solutions_carousel: 'Carrossel de soluções', monthly_maintenance: 'Contrato mensal', lp_buttons: 'LP: botões',
  lp_popup: 'LP: pop-up', lp_contract: 'LP: contrato', link: 'Link',
}
const ctaLabel = (c: WhatsAppClick) => CTA_LABEL[c.cta_location] || c.cta_location.replace(/_/g, ' ')

function origin(c: WhatsAppClick): string {
  if (c.gclid || c.gbraid || c.wbraid) return c.utm_term ? `Google Ads · "${c.utm_term}"` : 'Google Ads'
  if (c.utm_source) return [c.utm_source, c.utm_campaign].filter(Boolean).join(' · ')
  if (c.referrer_host) return /google\./.test(c.referrer_host) ? 'Busca do Google' : c.referrer_host
  return 'Acesso direto'
}
const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const DEVICE: Record<string, string> = { mobile: 'Celular', tablet: 'Tablet', desktop: 'Computador', unknown: '' }

// --- Identificar contato ---
const target = ref<WhatsAppClick | null>(null)
const form = ref({ name: '', phone: '', company_or_condominium: '', note: '' })
const saving = ref(false)
const formError = ref<string | null>(null)

function openIdentify(c: WhatsAppClick) {
  target.value = c
  form.value = { name: '', phone: '', company_or_condominium: '', note: '' }
  formError.value = null
}
async function saveIdentify() {
  if (!target.value || saving.value) return
  saving.value = true
  formError.value = null
  try {
    await $fetch(`/api/admin/whatsapp-clicks/${target.value.id}/identify`, {
      method: 'POST',
      body: {
        name: form.value.name,
        phone: form.value.phone,
        company_or_condominium: form.value.company_or_condominium || undefined,
        note: form.value.note || undefined,
      },
    })
    target.value = null
    await load()
  }
  catch (err: any) {
    formError.value = err?.data?.message || 'Não foi possível salvar.'
  }
  finally {
    saving.value = false
  }
}
async function setStatus(c: WhatsAppClick, next: 'pending' | 'ignored') {
  try {
    await $fetch(`/api/admin/whatsapp-clicks/${c.id}/status`, { method: 'PATCH', body: { status: next } })
    await load()
  }
  catch (err: any) {
    error.value = err?.data?.message || 'Não foi possível atualizar.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Cliques no WhatsApp</h1>
        <p class="text-xs text-gray-500 mt-1">
          Cada clique gera um código (ex.: PM-7K4QX) que chega no fim da mensagem. Digite o código para dizer quem é a pessoa.
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex rounded-xl border border-gray-200 bg-white p-0.5">
          <button v-for="p in periods" :key="p.id" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold" :class="period === p.id ? 'bg-[#09357a] text-white' : 'text-gray-600 hover:bg-gray-100'" @click="period = p.id">
            {{ p.label }}
          </button>
        </div>
        <button type="button" class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50" title="Atualizar" @click="load">
          <RotateCw class="w-4 h-4 text-gray-600" :class="loading ? 'animate-spin' : ''" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{{ error }}</div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="k in kpis" :key="k.label" class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{{ k.label }}</p>
        <p class="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{{ k.value }}</p>
        <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ k.hint }}</p>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <label class="relative w-full md:w-72">
          <span class="sr-only">Buscar código</span>
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input v-model="code" type="text" inputmode="text" autocomplete="off" placeholder="Digite o código (ex.: 7K4QX)" class="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#09357a]/30">
        </label>
        <div class="flex rounded-lg border border-slate-200 p-0.5 self-start md:self-auto">
          <button v-for="t in statusTabs" :key="t.id" type="button" class="px-3 py-1.5 rounded-md text-xs font-semibold" :class="status === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'" @click="status = t.id">
            {{ t.label }}
          </button>
        </div>
      </div>

      <div v-if="!loading && !data?.items.length" class="p-8 text-center text-xs text-gray-400">
        Nenhum clique {{ code ? 'com esse código' : 'neste filtro' }}.
      </div>
      <ul class="divide-y divide-slate-100">
        <li v-for="c in data?.items" :key="c.id" class="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" :class="c.status === 'ignored' ? 'opacity-60' : ''">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm font-bold text-slate-900">{{ c.code }}</span>
              <span v-if="c.channel === 'emergency'" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700">Plantão</span>
              <span v-if="c.gclid || c.gbraid || c.wbraid" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Anúncio</span>
              <span v-if="c.status === 'identified'" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Identificado</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">
              {{ fmt(c.created_at) }} · {{ ctaLabel(c) }} em {{ c.page_path }} · {{ origin(c) }}
              <template v-if="DEVICE[c.device]"> · {{ DEVICE[c.device] }}</template>
              <template v-if="c.city"> · {{ c.city }}</template>
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <template v-if="c.status === 'identified'">
              <NuxtLink to="/gestao/leads" class="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center">Ver em Leads</NuxtLink>
            </template>
            <template v-else>
              <button type="button" class="h-9 px-3 rounded-lg bg-[#09357a] hover:bg-[#07285c] text-white text-xs font-bold" @click="openIdentify(c)">Identificar</button>
              <button v-if="c.status === 'pending'" type="button" class="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600" title="A pessoa clicou mas não mandou mensagem" @click="setStatus(c, 'ignored')">Sem conversa</button>
              <button v-else type="button" class="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600" @click="setStatus(c, 'pending')">Reabrir</button>
            </template>
          </div>
        </li>
      </ul>
    </div>

    <!-- Identificar contato -->
    <div v-if="target" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="identify-title" @click.self="target = null">
      <form class="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-3" @submit.prevent="saveIdentify">
        <button type="button" class="absolute top-3 right-3 h-10 w-10 rounded-full text-slate-400 hover:bg-slate-100 flex items-center justify-center" aria-label="Fechar" @click="target = null">
          <X class="w-5 h-5" aria-hidden="true" />
        </button>
        <h2 id="identify-title" class="text-base font-bold text-slate-900">Quem mandou o código {{ target.code }}?</h2>
        <p class="text-[11px] text-slate-500">{{ fmt(target.created_at) }} · {{ origin(target) }}. Vira um lead em "Leads", já com a origem.</p>
        <label class="block text-xs font-semibold text-slate-700">Nome
          <input v-model="form.name" required minlength="2" maxlength="120" class="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm">
        </label>
        <label class="block text-xs font-semibold text-slate-700">Telefone / WhatsApp
          <input v-model="form.phone" required minlength="8" maxlength="30" inputmode="tel" class="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm">
        </label>
        <label class="block text-xs font-semibold text-slate-700">Condomínio / empresa (opcional)
          <input v-model="form.company_or_condominium" maxlength="160" class="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm">
        </label>
        <label class="block text-xs font-semibold text-slate-700">Observação (opcional)
          <textarea v-model="form.note" maxlength="1000" rows="2" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </label>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <button type="submit" :disabled="saving" class="w-full h-11 rounded-lg bg-[#09357a] hover:bg-[#07285c] disabled:opacity-60 text-white text-sm font-bold">
          {{ saving ? 'Salvando…' : 'Salvar e criar lead' }}
        </button>
      </form>
    </div>
  </div>
</template>
