import { useAuth } from '~/composables/useAuth'

export interface AdminAuthData {
  email: string
  role: string
}

export function useAdminState() {
  const { logout, loading: authLoading } = useAuth()

  // 1. Carregamento ÚNICO de /api/auth/me compartilhado em todo o app via chave estável
  const { data: adminData, pending: adminPending, error: adminError, refresh } = useFetch<AdminAuthData>(
    '/api/auth/me',
    {
      key: 'admin-auth-data',
      lazy: false,
      server: true,
    },
  )

  // 2. Cookie de preferência visual da sidebar (apenas boolean, sem dados sensíveis)
  const isSidebarCollapsed = useCookie<boolean>('admin_sidebar_collapsed', {
    default: () => false,
    sameSite: 'lax',
    path: '/gestao',
    secure: process.env.NODE_ENV === 'production',
  })

  // 3. Estado do drawer mobile (independente do desktop)
  const isMobileNavOpen = useState<boolean>('admin_mobile_nav_open', () => false)

  // Trava para evitar chamadas de logout concorrentes/duplicadas
  const isLoggingOut = ref(false)

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const toggleMobileNav = () => {
    isMobileNavOpen.value = !isMobileNavOpen.value
  }

  const closeMobileNav = () => {
    isMobileNavOpen.value = false
  }

  const handleLogout = async () => {
    if (isLoggingOut.value || authLoading.value) return
    isLoggingOut.value = true
    try {
      closeMobileNav()
      await logout()
    }
    finally {
      isLoggingOut.value = false
    }
  }

  return {
    adminData,
    adminPending,
    adminError,
    refreshAdmin: refresh,
    isSidebarCollapsed: readonly(isSidebarCollapsed),
    isMobileNavOpen: readonly(isMobileNavOpen),
    isLoggingOut: readonly(isLoggingOut),
    toggleSidebar,
    toggleMobileNav,
    closeMobileNav,
    handleLogout,
  }
}
