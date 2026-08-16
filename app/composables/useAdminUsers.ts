import type {
  AdminUserItem,
  AdminUsersSummary,
  AdminUsersPagination,
  AdminUserRole,
  AdminUserStatus,
  AdminUserAuditItem,
} from '~~/shared/types/adminUsers'

export function useAdminUsers() {
  const users = ref<AdminUserItem[]>([])
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)

  const summary = ref<AdminUsersSummary>({
    active_admins: 0,
    active_editors: 0,
    pending_invites: 0,
  })

  const pagination = ref<AdminUsersPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })

  const search = ref('')
  const selectedRole = ref<string>('all')
  const selectedStatus = ref<string>('all')
  const page = ref(1)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{
        users: AdminUserItem[]
        pagination: AdminUsersPagination
        summary: AdminUsersSummary
      }>('/api/admin/users/search', {
        method: 'POST',
        body: {
          search: search.value,
          role: selectedRole.value,
          status: selectedStatus.value,
          page: page.value,
          limit: pagination.value.limit,
        },
      })
      users.value = data.users
      pagination.value = data.pagination
      summary.value = data.summary
    }
    catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Erro ao carregar administradores.'
    }
    finally {
      loading.value = false
    }
  }

  const inviteUser = async (email: string, role: AdminUserRole) => {
    actionLoading.value = true
    error.value = null
    try {
      const idempotencyKey = crypto.randomUUID()
      const res = await $fetch<{ success: boolean; message: string; delivery_status?: string }>('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { email, role },
      })
      await fetchUsers()
      return res
    }
    catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Erro ao convidar administrador.'
      error.value = msg
      throw new Error(msg)
    }
    finally {
      actionLoading.value = false
    }
  }

  const resendInvite = async (userId: string) => {
    actionLoading.value = true
    error.value = null
    try {
      const idempotencyKey = crypto.randomUUID()
      const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/users/${userId}/resend-invite`, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
      })
      await fetchUsers()
      return res
    }
    catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Erro ao reenviar convite.'
      error.value = msg
      throw new Error(msg)
    }
    finally {
      actionLoading.value = false
    }
  }

  const updateRole = async (userId: string, role: AdminUserRole) => {
    actionLoading.value = true
    error.value = null
    try {
      const res = await $fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      })
      await fetchUsers()
      return res
    }
    catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Erro ao alterar função.'
      error.value = msg
      throw new Error(msg)
    }
    finally {
      actionLoading.value = false
    }
  }

  const updateStatus = async (userId: string, isActive: boolean) => {
    actionLoading.value = true
    error.value = null
    try {
      const res = await $fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: { is_active: isActive },
      })
      await fetchUsers()
      return res
    }
    catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Erro ao alterar status.'
      error.value = msg
      throw new Error(msg)
    }
    finally {
      actionLoading.value = false
    }
  }

  const fetchAudit = async (auditPage = 1, limit = 20, userId?: string) => {
    return await $fetch<{
      items: AdminUserAuditItem[]
      pagination: AdminUsersPagination
    }>('/api/admin/users/audit', {
      params: { page: auditPage, limit, userId },
    })
  }

  return {
    users,
    loading,
    actionLoading,
    error,
    summary,
    pagination,
    search,
    selectedRole,
    selectedStatus,
    page,
    fetchUsers,
    inviteUser,
    resendInvite,
    updateRole,
    updateStatus,
    fetchAudit,
  }
}
