import type { Component } from 'vue'
import {
  LayoutDashboard,
  Wrench,
  Images,
  Users,
  ShieldCheck,
  ChartNoAxesCombined,
  Settings,
} from '@lucide/vue'

export interface NavItem {
  id: string
  title: string
  to: string
  icon: Component
  disabled?: boolean
  adminOnly?: boolean
  badge?: string
  tooltip?: string
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'visao-geral',
    title: 'Visão geral',
    to: '/gestao',
    icon: LayoutDashboard,
    disabled: false,
    tooltip: 'Visão geral do painel',
  },
  {
    id: 'servicos',
    title: 'Serviços',
    to: '/gestao/servicos',
    icon: Wrench,
    disabled: false,
    tooltip: 'Gestão de Serviços',
  },
  {
    id: 'publicacoes',
    title: 'Publicações',
    to: '/gestao/publicacoes',
    icon: Images,
    disabled: false,
    tooltip: 'Gestão de Publicações e Portfólio',
  },
  {
    id: 'leads',
    title: 'Leads',
    to: '/gestao/leads',
    icon: Users,
    disabled: false,
    tooltip: 'Gestão de Leads e Orçamentos',
  },
  {
    id: 'administradores',
    title: 'Administradores',
    to: '/gestao/administradores',
    icon: ShieldCheck,
    disabled: false,
    adminOnly: true,
    tooltip: 'Gestão Segura de Administradores',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    to: '/gestao/analytics',
    icon: ChartNoAxesCombined,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de analytics (Em breve)',
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    to: '/gestao/configuracoes',
    icon: Settings,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de configurações (Em breve)',
  },
]

export function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (item.disabled) return false
  if (item.to === '/gestao') {
    return currentPath === '/gestao' || currentPath === '/gestao/'
  }
  return currentPath === item.to || currentPath.startsWith(`${item.to}/`)
}
