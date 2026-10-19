import { ref, watch } from 'vue'
import type {
  AdminAnalyticsDashboard,
  AnalyticsPeriodSelection,
} from '~~/shared/types/adminAnalytics'

const sameSelection = (a: AnalyticsPeriodSelection, b: AnalyticsPeriodSelection) =>
  a.key === b.key && a.from === b.from && a.to === b.to

export function useAdminAnalytics() {
  const selectedPeriod = ref<AnalyticsPeriodSelection>({ key: '30' })
  const dashboardData = ref<AdminAnalyticsDashboard | null>(null)
  const isPending = ref(true)
  const error = ref<Error | null>(null)

  const fetchAnalytics = async () => {
    isPending.value = true
    error.value = null

    const { key, from, to } = selectedPeriod.value
    const params: Record<string, string> = { period: key }
    if (key === 'custom' && from && to) {
      params.from = from
      params.to = to
    }

    try {
      const response = await $fetch<AdminAnalyticsDashboard>('/api/admin/analytics/dashboard', { params })
      dashboardData.value = response
    }
    catch (err: any) {
      error.value = err
      console.error('[useAdminAnalytics] Erro ao carregar métricas:', err?.data?.message || err?.message || err)
    }
    finally {
      isPending.value = false
    }
  }

  const setPeriod = (period: AnalyticsPeriodSelection) => {
    if (sameSelection(selectedPeriod.value, period)) return
    selectedPeriod.value = { ...period }
  }

  // Refetch automático quando o período mudar
  watch(selectedPeriod, () => {
    fetchAnalytics()
  })

  // Carga inicial no cliente
  onMounted(() => {
    fetchAnalytics()
  })

  return {
    selectedPeriod,
    dashboardData,
    isPending,
    error,
    refresh: fetchAnalytics,
    setPeriod,
  }
}
