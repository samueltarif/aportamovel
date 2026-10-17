<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Download, MessageCircle, Phone, RotateCw } from '@lucide/vue'
import type { Lead, LeadStatus } from '~~/shared/types/leads'
import { parseLeadTracking, normalizeBrPhone } from '~~/shared/utils/leadTracking'
import { useLeads } from '~/composables/useLeads'
import { useAdminState } from '~/composables/useAdminState'
import LeadStatusBadge from '~/components/leads/LeadStatusBadge.vue'
import LeadDetailSheet from '~/components/leads/LeadDetailSheet.vue'

definePageMeta({
  layout: 'gestao',
  middleware: 'gestao',
})

useHead({ title: 'Campanha Google Ads - A Portamóvel' })

const { adminData } = useAdminState()
const isAdmin = computed(() => adminData.value?.role === 'admin')
const { selectedLead, fetchLeadDetail, updateStatus, addNote, toggleArchive } = useLeads()

type Period = '7' | '30' | '90' | 'all'
const period = ref<Period>('30')
const leads = ref<Lead[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const isDetailOpen = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    leads.value = await $fetch<Lead[]>('/api/admin/leads/campaign', { params: { period: period.value } })
  }
  catch (err: any) {
    error.value = err?.data?.message || 'Erro ao carregar os leads da campanha.'
  }
  finally {
    loading.value = false
  }
}

onMounted(load)
watch(period, load)

interface Row {
  lead: Lead
  canal: 'WhatsApp' | 'Formulário'
  turno: string
  kw: string
  gclid: string
  fromAds: boolean
}

const rows = computed<Row[]>(() =>
  leads.value.map((lead) => {
    const { tracking } = parseLeadTracking(lead.message)
    const isWa = tracking.canal === 'whatsapp_popup' || lead.service_slug === 'whatsapp-lp-condominios'
    return {
      lead,
      canal: isWa ? 'WhatsApp' : 'Formulário',
      turno: tracking.turno === 'plantao' ? 'Plantão' : tracking.turno === 'day' ? 'Comercial' : '—',
      kw: tracking.kw || '',
      gclid: tracking.gclid || tracking.gbraid || tracking.wbraid || '',
      fromAds: !!(tracking.gclid || tracking.gbraid || tracking.wbraid) || lead.utm_source === 'google',
    }
  }),
)

const valid = computed(() => rows.value.filter(r => r.lead.status !== 'spam'))
const QUALIFIED: LeadStatus[] = ['qualified', 'proposal_sent', 'won']

const kpis = computed(() => {
  const v = valid.value
  const qualified = v.filter(r => QUALIFIED.includes(r.lead.status)).length
  const avaliados = v.filter(r => r.lead.status !== 'new').length
  return [
    { label: 'Leads', value: v.length, hint: 'sem contar spam' },
    { label: 'Pelo WhatsApp', value: v.filter(r => r.canal === 'WhatsApp').length, hint: 'deixaram o número no pop-up' },
    { label: 'Pelo formulário', value: v.filter(r => r.canal === 'Formulário').length, hint: 'pedido de orçamento' },
    { label: 'Vindos do anúncio', value: v.filter(r => r.fromAds).length, hint: 'com clique do Google Ads' },
    { label: 'Qualificados', value: qualified, hint: avaliados ? `${Math.round((qualified / avaliados) * 100)}% dos já avaliados` : 'marque o status de cada lead' },
    { label: 'Ganhos', value: v.filter(r => r.lead.status === 'won').length, hint: 'serviço ou contrato fechado' },
  ]
})

const byKeyword = computed(() => {
  const map = new Map<string, { total: number, qualified: number }>()
  for (const r of valid.value) {
    const key = r.kw || (r.fromAds ? '(anúncio sem palavra registrada)' : '(fora do anúncio)')
    const cur = map.get(key) || { total: 0, qualified: 0 }
    cur.total++
    if (QUALIFIED.includes(r.lead.status)) cur.qualified++
    map.set(key, cur)
  }
  return [...map.entries()].map(([kw, c]) => ({ kw, ...c })).sort((a, b) => b.total - a.total).slice(0, 12)
})

const pending = computed(() => valid.value.filter(r => r.lead.status === 'new').length)

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function waLink(phone: string) {
  const text = 'Olá! Aqui é da A Portamóvel. Recebemos seu contato pelo site sobre o portão do condomínio.'
  return `https://wa.me/55${normalizeBrPhone(phone)}?text=${encodeURIComponent(text)}`
}

async function openLead(id: string) {
  await fetchLeadDetail(id)
  isDetailOpen.value = true
}

async function handleUpdateStatus(status: LeadStatus) {
  if (!selectedLead.value) return
  await updateStatus(selectedLead.value.id, status)
  await load()
}

async function handleAddNote(note: string) {
  if (!selectedLead.value) return
  await addNote(selectedLead.value.id, note)
}

async function handleToggleArchive(archived: boolean) {
  if (!selectedLead.value) return
  await toggleArchive(selectedLead.value.id, archived)
  isDetailOpen.value = false
  await load()
}

// --- Exportação para importação de conversões offline no Google Ads ---
// Só gclid entra nesta planilha (gbraid/wbraid de iPhone usam outro modelo do Google)
const exportable = computed(() => valid.value.filter(r => !!parseLeadTracking(r.lead.message).tracking.gclid && QUALIFIED.includes(r.lead.status)))

function gadsTime(iso: string) {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(d)
  const get = (t: string) => parts.find(p => p.type === t)?.value || '00'
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

function exportCsv() {
  const lines = [
    'Parameters:TimeZone=America/Sao_Paulo',
    'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency',
  ]
  for (const r of exportable.value) {
    const { tracking } = parseLeadTracking(r.lead.message)
    if (!tracking.gclid) continue
    const t = gadsTime(r.lead.created_at)
    lines.push(`${tracking.gclid},PM | Lead qualificado condominio (offline),${t},,BRL`)
    if (r.lead.status === 'won') {
      lines.push(`${tracking.gclid},PM | Servico ou contrato fechado (offline),${gadsTime(r.lead.updated_at)},,BRL`)
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `conversoes-offline-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

const periods: { id: Period, label: string }[] = [
  { id: '7', label: '7 dias' },
  { id: '30', label: '30 dias' },
  { id: '90', label: '90 dias' },
  { id: 'all', label: 'Tudo' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Campanha Google Ads</h1>
        <p class="text-xs text-gray-500 mt-1">Leads da página de condomínios (/lp/condominios): WhatsApp e formulário</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex rounded-xl border border-gray-200 bg-white p-0.5">
          <button
            v-for="p in periods"
            :key="p.id"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold"
            :class="period === p.id ? 'bg-[#09357a] text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="period = p.id"
          >
            {{ p.label }}
          </button>
        </div>
        <button type="button" class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50" title="Atualizar" @click="load">
          <RotateCw class="w-4 h-4 text-gray-600" :class="loading ? 'animate-spin' : ''" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{{ error }}</div>

    <div v-if="pending" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
      {{ pending }} lead(s) ainda como "Novo". Responda rápido e marque o status: é isso que mostra quais palavras trazem condomínio.
    </div>

    <!-- Indicadores -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <div v-for="k in kpis" :key="k.label" class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{{ k.label }}</p>
        <p class="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{{ loading && !leads.length ? '…' : k.value }}</p>
        <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ k.hint }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- Lista de leads -->
      <div class="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Leads ({{ valid.length }})</h2>
        </div>
        <div v-if="!loading && !rows.length" class="p-8 text-center text-xs text-gray-400">
          Nenhum lead da campanha neste período.
        </div>
        <ul class="divide-y divide-slate-100">
          <li v-for="r in rows" :key="r.lead.id" class="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" :class="r.lead.status === 'spam' ? 'opacity-50' : ''">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-slate-900 tabular-nums">{{ r.lead.phone }}</span>
                <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" :class="r.canal === 'WhatsApp' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'">{{ r.canal }}</span>
                <span v-if="r.fromAds" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Anúncio</span>
                <LeadStatusBadge :status="r.lead.status" />
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5 truncate">
                {{ fmtDate(r.lead.created_at) }} · {{ r.turno }}
                <template v-if="r.lead.full_name && r.canal === 'Formulário'"> · {{ r.lead.full_name }}</template>
                <template v-if="r.lead.company_or_condominium"> · {{ r.lead.company_or_condominium }}</template>
                <template v-if="r.kw"> · palavra: "{{ r.kw }}"</template>
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a :href="waLink(r.lead.phone)" target="_blank" rel="noopener noreferrer" class="h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
                <MessageCircle class="w-4 h-4" aria-hidden="true" /> WhatsApp
              </a>
              <a :href="`tel:${normalizeBrPhone(r.lead.phone)}`" class="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center" :aria-label="`Ligar para ${r.lead.phone}`">
                <Phone class="w-4 h-4 text-slate-600" aria-hidden="true" />
              </a>
              <button type="button" class="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700" @click="openLead(r.lead.id)">
                Status
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div class="space-y-4">
        <!-- Por palavra-chave -->
        <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div class="px-4 py-3 border-b border-slate-100">
            <h2 class="text-sm font-bold text-slate-800">Por palavra-chave</h2>
            <p class="text-[11px] text-slate-500">Quais buscas trazem lead e quais trazem condomínio de verdade</p>
          </div>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-left text-slate-500">
                <th class="px-4 py-2 font-semibold">Palavra</th>
                <th class="px-2 py-2 font-semibold text-right">Leads</th>
                <th class="px-4 py-2 font-semibold text-right">Qualif.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in byKeyword" :key="k.kw" class="border-t border-slate-100">
                <td class="px-4 py-2 text-slate-800">{{ k.kw }}</td>
                <td class="px-2 py-2 text-right tabular-nums">{{ k.total }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ k.qualified }}</td>
              </tr>
              <tr v-if="!byKeyword.length"><td colspan="3" class="px-4 py-4 text-center text-slate-400">Sem dados ainda</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Conversões offline -->
        <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-2">
          <h2 class="text-sm font-bold text-slate-800">Ensinar o Google Ads</h2>
          <p class="text-[11px] text-slate-500 leading-snug">
            Baixe os leads marcados como Qualificado, Proposta ou Ganho que vieram de um clique no anúncio e envie em
            Google Ads → Metas → Conversões → Uploads. Assim o Google aprende a trazer mais condomínios.
          </p>
          <button
            type="button"
            class="w-full h-10 rounded-lg bg-[#09357a] hover:bg-[#07285c] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-2"
            :disabled="!exportable.length"
            @click="exportCsv"
          >
            <Download class="w-4 h-4" aria-hidden="true" /> Baixar planilha ({{ exportable.length }})
          </button>
        </div>
      </div>
    </div>

    <LeadDetailSheet
      :lead="selectedLead"
      :is-open="isDetailOpen"
      :is-admin="isAdmin"
      @close="isDetailOpen = false"
      @update-status="handleUpdateStatus"
      @add-note="handleAddNote"
      @toggle-archive="handleToggleArchive"
    />
  </div>
</template>
