import type { Component } from 'vue'
import {
  LayoutDashboard,
  Wrench,
  Images,
  Users,
  ChartNoAxesCombined,
  Settings,
} from '@lucide/vue'

export interface NavItem {
  id: string
  title: string
  href: string
  icon: Component
  disabled?: boolean
  badge?: string
  tooltip?: string
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'visao-geral',
    title: 'Visão geral',
    href: '/gestao',
    icon: LayoutDashboard,
    tooltip: 'Visão geral do painel',
  },
  {
    id: 'servicos',
    title: 'Serviços',
    href: '/gestao/servicos',
    icon: Wrench,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de serviços (Em breve)',
  },
  {
    id: 'publicacoes',
    title: 'Publicações',
    href: '/gestao/publicacoes',
    icon: Images,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de publicações (Em breve)',
  },
  {
    id: 'leads',
    title: 'Leads',
    href: '/gestao/leads',
    icon: Users,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de leads (Em breve)',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    href: '/gestao/analytics',
    icon: ChartNoAxesCombined,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de analytics (Em breve)',
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    href: '/gestao/configuracoes',
    icon: Settings,
    disabled: true,
    badge: 'Em breve',
    tooltip: 'Módulo de configurações (Em breve)',
  },
]

export function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (item.disabled) return false
  if (item.href === '/gestao') {
    return currentPath === '/gestao' || currentPath === '/gestao/'
  }
  return currentPath.startsWith(item.href)
}
