<script setup lang="ts">
import {
  Users,
  Eye,
  MessageCircle,
  Send,
  Phone,
  RotateCw,
  AlertTriangle,
} from '@lucide/vue'
import MetricCard from '~/components/dashboard/MetricCard.vue'
import PeriodSelector from '~/components/dashboard/PeriodSelector.vue'
import TrendChart from '~/components/dashboard/TrendChart.vue'
import TopPagesTable from '~/components/dashboard/TopPagesTable.vue'
import TopServicesCard from '~/components/dashboard/TopServicesCard.vue'
import TrafficSourcesCard from '~/components/dashboard/TrafficSourcesCard.vue'
import LocationsCard from '~/components/dashboard/LocationsCard.vue'
import RecentLeadsCard from '~/components/dashboard/RecentLeadsCard.vue'
import SystemStatusCard from '~/components/dashboard/SystemStatusCard.vue'

definePageMeta({
  middleware: ['gestao'],
  layout: 'gestao',
})

const { adminData } = useAdminState()
const {
  selectedPeriod,
  dashboardData,
  isPending,
  error,
  refresh,
  setPeriod,
} = useAdminAnalytics()

const greeting = ref('Bem-vindo')

onMounted(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) greeting.value = 'Bom dia'
  else if (hour >= 12 && hour < 18) greeting.value = 'Boa tarde'
  else greeting.value = 'Boa noite'
})

const lastUpdated = computed(() => {
  if (!dashboardData.value?.meta?.generatedAt) return null
  return new Date(dashboardData.value.meta.generatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header com Saudação, Seletor de Período e Atualização -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-[#09357a] tracking-tight">
          {{ greeting }}, {{ adminData?.email?.split('@')[0] || 'Administrador' }}!
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Indicadores analíticos de produção da A Portamóvel.
        </p>
      </div>

      <div class="flex items-center gap-3 self-start sm:self-auto bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs">
        <PeriodSelector
          :model-value="selectedPeriod"
          :disabled="isPending"
          @update:model-value="setPeriod"
        />

        <button
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
          :disabled="isPending"
          title="Atualizar métricas"
          @click="refresh"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isPending }" />
        </button>

        <span v-if="lastUpdated" class="text-[11px] text-slate-400 font-medium pr-1.5 border-l pl-2 hidden md:inline">
          Atualizado às {{ lastUpdated }}
        </span>
      </div>
    </div>

    <!-- Banner de Dados Desatualizados (Stale Cache) -->
    <div
      v-if="dashboardData?.meta?.stale"
      class="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center justify-between"
    >
      <div class="flex items-center space-x-2">
        <AlertTriangle class="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>Exibindo dados em cache recente enquanto restabelecemos a conexão com o PostHog.</span>
      </div>
      <button class="font-bold underline hover:text-amber-900" @click="refresh">Tentar agora</button>
    </div>

    <!-- Banner de Erro Geral -->
    <div
      v-if="error"
      class="p-4 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-700 flex items-center justify-between"
    >
      <div class="flex items-center space-x-2">
        <AlertTriangle class="w-4 h-4 text-red-600 flex-shrink-0" />
        <span>Não foi possível carregar as métricas do PostHog no momento.</span>
      </div>
      <button class="font-bold underline hover:text-red-900" @click="refresh">Tentar novamente</button>
    </div>

    <!-- Seção 1: Indicadores Principais (5 Cards) -->
    <section aria-label="Indicadores principais" class="space-y-3">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Métricas do Site Público</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Visitantes Únicos"
          description="Pessoas que navegaram no site no período."
          :value="dashboardData?.summary?.uniqueVisitors?.current"
          :change="dashboardData?.summary?.uniqueVisitors?.changePercent"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.summary?.uniqueVisitors?.status || 'ready'))"
          :icon="Users"
        />

        <MetricCard
          title="Visualizações de Páginas"
          description="Total de páginas visualizadas."
          :value="dashboardData?.summary?.pageviews?.current"
          :change="dashboardData?.summary?.pageviews?.changePercent"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.summary?.pageviews?.status || 'ready'))"
          :icon="Eye"
        />

        <MetricCard
          title="Cliques no WhatsApp"
          description="Cliques nos botões de atendimento."
          :value="dashboardData?.summary?.whatsappClicks?.current"
          :change="dashboardData?.summary?.whatsappClicks?.changePercent"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.summary?.whatsappClicks?.status || 'ready'))"
          :icon="MessageCircle"
        />

        <MetricCard
          title="Cliques em Telefones"
          description="Ligações iniciadas via links diretos."
          :value="dashboardData?.summary?.phoneClicks?.current"
          :change="dashboardData?.summary?.phoneClicks?.changePercent"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.summary?.phoneClicks?.status || 'ready'))"
          :icon="Phone"
        />

        <MetricCard
          title="Solicitações enviadas"
          description="Formulários de orçamento submetidos."
          :value="dashboardData?.summary?.quoteSubmissions?.current"
          :change="dashboardData?.summary?.quoteSubmissions?.changePercent"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.summary?.quoteSubmissions?.status || 'ready'))"
          :icon="Send"
        />
      </div>
    </section>

    <!-- Seção 2: Gráfico de Tendência Temporal -->
    <section aria-label="Tendência de acessos">
      <TrendChart
        :points="dashboardData?.trend?.data || []"
        :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.trend?.status || 'ready'))"
      />
    </section>

    <!-- Seção 3: Detalhamentos em Grid 2x2 -->
    <section aria-label="Detalhamentos analíticos" class="space-y-3">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhamentos e Comportamento</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TopPagesTable
          :pages="dashboardData?.topPages?.data || []"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.topPages?.status || 'ready'))"
        />

        <TopServicesCard
          :services="dashboardData?.topServices?.data || []"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.topServices?.status || 'ready'))"
        />

        <TrafficSourcesCard
          :sources="dashboardData?.trafficSources?.data || []"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.trafficSources?.status || 'ready'))"
        />

        <LocationsCard
          :locations="dashboardData?.locations?.data || []"
          :status="isPending ? 'loading' : (error ? 'error' : (dashboardData?.locations?.status || 'ready'))"
        />
      </div>
    </section>

    <!-- Seção 4: Leads Recentes e Status da Aplicação -->
    <section aria-label="Status do sistema e leads" class="space-y-3">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cadastros e Conectividade</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RecentLeadsCard />

        <SystemStatusCard
          :role="adminData?.role"
          :email="adminData?.email"
        />
      </div>
    </section>
  </div>
</template>
