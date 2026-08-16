import { ref } from 'vue'
import type { PublicServiceItem } from '~/../shared/types/services'

const STATIC_FALLBACK_SERVICES: PublicServiceItem[] = [
  {
    id: '1',
    name: 'Manutenção de Portões de Garagem e Pedestres',
    slug: 'manutencao-portoes',
    short_description: 'Preventiva e corretiva',
    description: 'Manutenção preventiva e corretiva em portões de garagem e pedestres de todos os modelos e marcas, garantindo o perfeito funcionamento, segurança e conforto dos usuários.',
    card_image_url: '/images/services/manutencao-portoes.webp',
    card_image_alt: 'Técnicos da A Portamóvel realizando manutenção de portão automático de garagem com veículo de apoio',
    icon_key: 'gate',
    accent_variant: 'blue',
    display_order: 1,
    is_featured: true,
    home_display_order: 1,
    publications_count: 1,
    has_publications: true,
  },
  {
    id: '2',
    name: 'Recuperação, Fabricação e Repintura de Gradis',
    slug: 'recuperacao-gradis',
    short_description: 'Mais beleza, proteção e valorização',
    description: 'Recuperamos e fabricamos gradis danificados por ferrugem, impactos ou desgaste do tempo, com repintura profissional que devolve a beleza, proteção e durabilidade.',
    card_image_url: '/images/services/recuperacao-gradis.webp',
    card_image_alt: 'Gradil metálico de condomínio recuperado e repintado',
    icon_key: 'fence',
    accent_variant: 'blue',
    display_order: 2,
    is_featured: true,
    home_display_order: 2,
    publications_count: 0,
    has_publications: false,
  },
  {
    id: '3',
    name: 'Troca de Cabos de Aço por Kit de Corrente',
    slug: 'kit-corrente-portao',
    short_description: 'Mais segurança, menos ruídos e quebras',
    description: 'Substituímos cabos de aço por kits de corrente, reduzindo quebras, ruídos e manutenções frequentes, aumentando a segurança e a durabilidade do portão.',
    card_image_url: '/images/services/kit-corrente-portao.webp',
    card_image_alt: 'Kit de corrente e engrenagem para acionamento de portão',
    icon_key: 'chain',
    accent_variant: 'red',
    display_order: 3,
    is_featured: true,
    home_display_order: 3,
    publications_count: 0,
    has_publications: false,
  },
  {
    id: '4',
    name: 'Troca de Trilhos Inferiores e Superiores',
    slug: 'troca-trilhos',
    short_description: 'Deslizamento suave e alinhamento do sistema',
    description: 'A substituição de trilhos desgastados garante o deslizamento suave do portão, evitando desalinhamentos, ruídos e danos aos componentes.',
    card_image_url: '/images/services/troca-trilhos.webp',
    card_image_alt: 'Substituição e alinhamento de trilhos para portão deslizante',
    icon_key: 'rail',
    accent_variant: 'blue',
    display_order: 4,
    is_featured: true,
    home_display_order: 4,
    publications_count: 0,
    has_publications: false,
  },
  {
    id: '5',
    name: 'Serralheria em Geral',
    slug: 'serralheria-geral',
    short_description: 'Reformas, ajustes e fabricações',
    description: 'Serviços de serralheria para portões, portas, grades, corrimãos e estruturas metálicas em geral. Recuperação, fabricação e acabamento com qualidade que valorizam o patrimônio do condomínio.',
    card_image_url: '/images/services/serralheria-geral.webp',
    card_image_alt: 'Profissional realizando serviço de serralheria com solda',
    icon_key: 'welding',
    accent_variant: 'red',
    display_order: 5,
    is_featured: true,
    home_display_order: 5,
    publications_count: 0,
    has_publications: false,
  },
  {
    id: '6',
    name: 'Portas Corta-Fogo e Estruturas Metálicas',
    slug: 'portas-corta-fogo',
    short_description: 'Ajustes, manutenção preventiva e adequação às normas',
    description: 'Manutenção, ajuste e recuperação de portas corta-fogo, garantindo a conformidade com as normas de segurança e a proteção do seu condomínio.',
    card_image_url: '/images/services/portas-corta-fogo.webp',
    card_image_alt: 'Porta corta-fogo para condomínios e edifícios',
    icon_key: 'door',
    accent_variant: 'blue',
    display_order: 6,
    is_featured: true,
    home_display_order: 6,
    publications_count: 0,
    has_publications: false,
  },
  {
    id: '7',
    name: 'Troca de Roldanas Simples por Roldanas Duplas (Truck)',
    slug: 'roldanas-duplas-truck',
    short_description: 'Maior estabilidade e vida útil',
    description: 'A troca proporciona menor desgaste, mais estabilidade e maior vida útil para portões deslizantes, evitando travamentos e manutenções constantes.',
    card_image_url: '/images/services/roldanas-duplas-truck.webp',
    card_image_alt: 'Roldanas duplas tipo truck para portões deslizantes pesados',
    icon_key: 'roller',
    accent_variant: 'red',
    display_order: 7,
    is_featured: true,
    home_display_order: 7,
    publications_count: 0,
    has_publications: false,
  },
]

export function usePublicServices() {
  const config = useRuntimeConfig()
  const isDynamicEnabled = String(config.public.dynamicServicesEnabled) === 'true'

  const services = ref<PublicServiceItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchServices = async (options?: { onlyFeatured?: boolean }) => {
    if (!isDynamicEnabled) {
      services.value = options?.onlyFeatured
        ? STATIC_FALLBACK_SERVICES.filter((s) => s.is_featured).sort((a, b) => a.home_display_order - b.home_display_order)
        : STATIC_FALLBACK_SERVICES.sort((a, b) => a.display_order - b.display_order)
      return
    }

    loading.value = true
    error.value = null
    try {
      const data = await $fetch<PublicServiceItem[]>('/api/public/services', {
        params: options?.onlyFeatured ? { featured: 'true' } : {},
      })
      services.value = data || []
    } catch (err: any) {
      console.error('[usePublicServices] Erro ao carregar serviços dinâmicos, usando fallback:', err)
      error.value = 'Falha ao carregar catálogo.'
      services.value = options?.onlyFeatured
        ? STATIC_FALLBACK_SERVICES.filter((s) => s.is_featured)
        : STATIC_FALLBACK_SERVICES
    } finally {
      loading.value = false
    }
  }

  return {
    services,
    loading,
    error,
    isDynamicEnabled,
    fetchServices,
  }
}
