<script setup lang="ts">
import {
  Users,
  Eye,
  MessageCircle,
  UserRoundPlus,
  TrendingUp,
  Wrench,
  Compass,
  Inbox,
} from '@lucide/vue'
import MetricCard from '~/components/dashboard/MetricCard.vue'
import DashboardEmptyState from '~/components/dashboard/DashboardEmptyState.vue'
import SystemStatusCard from '~/components/dashboard/SystemStatusCard.vue'

definePageMeta({
  middleware: ['gestao'],
  layout: 'gestao',
})

// Reutiliza os dados de admin carregados UMA ÚNICA VEZ pelo composable/layout
const { adminData, adminPending } = useAdminState()

// Calculo seguro de saudacao baseada no horario do cliente para evitar hidratacao SSR incorreta
const greeting = ref('Bem-vindo')

onMounted(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    greeting.value = 'Bom dia'
  }
  else if (hour >= 12 && hour < 18) {
    greeting.value = 'Boa tarde'
  }
  else {
    greeting.value = 'Boa noite'
  }
})

useHead({
  title: 'Painel Administrativo | A Portamóvel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div class="space-y-8">
    <!-- Cabeçalho do Dashboard com Saudação Segura -->
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ greeting }}, {{ adminData?.email ? adminData.email.split('@')[0] : 'Administrador' }}!
        </h1>
        <p class="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Acompanhe os principais indicadores e o status da A Portamóvel.
        </p>
      </div>
    </div>

    <!-- Seção: Indicadores Principais (4 Cards sem dados falsos) -->
    <section aria-label="Indicadores principais" class="space-y-3">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Métricas da aplicação</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Visitantes únicos"
          description="Pessoas que acessaram o site no período."
          :status="adminPending ? 'loading' : 'unavailable'"
          :icon="Users"
        />

        <MetricCard
          title="Visualizações de páginas"
          description="Total de páginas visualizadas no site."
          :status="adminPending ? 'loading' : 'unavailable'"
          :icon="Eye"
        />

        <MetricCard
          title="Cliques no WhatsApp"
          description="Cliques nos botões de atendimento direto."
          :status="adminPending ? 'loading' : 'unavailable'"
          :icon="MessageCircle"
        />

        <MetricCard
          title="Leads recebidos"
          description="Contatos enviados através dos formulários."
          :status="adminPending ? 'loading' : 'unavailable'"
          :icon="UserRoundPlus"
        />
      </div>
    </section>

    <!-- Seção: Status Real do Sistema -->
    <section aria-label="Status do sistema">
      <SystemStatusCard
        :role="adminData?.role"
        :email="adminData?.email"
      />
    </section>

    <!-- Seção: Seções Secundárias (Empty States Honestos) -->
    <section aria-label="Análises e registros futuros" class="space-y-3">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhamentos e Relatórios</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DashboardEmptyState
          title="Desempenho do site"
          description="Os dados de navegação aparecerão aqui quando a coleta de analytics for configurada."
          :icon="TrendingUp"
        />

        <DashboardEmptyState
          title="Serviços mais visualizados"
          description="As visualizações por serviço aparecerão aqui quando o módulo de serviços estiver conectado."
          :icon="Wrench"
        />

        <DashboardEmptyState
          title="Origem dos acessos"
          description="As fontes de tráfego aparecerão aqui quando o analytics estiver configurado."
          :icon="Compass"
        />

        <DashboardEmptyState
          title="Leads recentes"
          description="Os contatos enviados pelo site aparecerão aqui quando o módulo de leads estiver disponível."
          :icon="Inbox"
        />
      </div>
    </section>
  </div>
</template>
