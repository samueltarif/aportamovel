import { ref, watch } from 'vue'
import type { AdminAnalyticsDashboard, AnalyticsPeriod } from '~~/shared/types/adminAnalytics'

export function useAdminAnalytics() {
  const selectedPeriod = ref<AnalyticsPeriod>(30)
  const dashboardData = ref<AdminAnalyticsDashboard | null>(null)
  const isPending = ref(true)
  const error = ref<Error | null>(null)

  const fetchAnalytics = async () => {
    isPending.value = true
    error.value = null

    try {
      const response = await $fetch<AdminAnalyticsDashboard>('/api/admin/analytics/dashboard', {
        params: { period: selectedPeriod.value },
      })
      dashboardData.value = response
    }
    catch (err: any) {
      error.value = err
      console.error('[useAdminAnalytics] Erro ao carregar métricas:', err?.message || err)
    }
    finally {
      isPending.value = false
    }
  }

  const setPeriod = (period: AnalyticsPeriod) => {
    if (selectedPeriod.value === period) return
    selectedPeriod.value = period
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
