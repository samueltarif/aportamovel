export type AdminUserRole = 'admin' | 'editor'

export type AdminUserStatus = 'active' | 'inactive' | 'pending'

export interface AdminUserItem {
  id: string
  email: string
  role: AdminUserRole
  is_active: boolean
  accepted_at: string | null
  status: AdminUserStatus
  created_at: string
  invited_at?: string | null
  last_sign_in_at?: string | null
}

export interface AdminUsersSummary {
  active_admins: number
  active_editors: number
  pending_invites: number
}

export interface AdminUsersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminUsersListResponse {
  users: AdminUserItem[]
  pagination: AdminUsersPagination
  summary: AdminUsersSummary
}

export type AdminUserAuditAction =
  | 'invited'
  | 'invite_resent'
  | 'invite_accepted'
  | 'role_changed'
  | 'activated'
  | 'deactivated'

export interface AdminUserAuditItem {
  id: string
  target_user_id: string
  actor_user_id: string
  target_email?: string
  actor_email?: string
  action: AdminUserAuditAction
  old_role: string | null
  new_role: string | null
  old_is_active: boolean | null
  new_is_active: boolean | null
  created_at: string
}

export interface AdminUserFilterParams {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export interface InviteAdminInput {
  email: string
  role: AdminUserRole
}

export interface UpdateRoleInput {
  role: AdminUserRole
}

export interface UpdateStatusInput {
  is_active: boolean
}

export interface AcceptInviteInput {
  password?: string
}
