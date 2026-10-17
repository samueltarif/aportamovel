<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Cog,
  Hammer,
  HardHat,
  MapPin,
  ShieldCheck,
  Siren,
  Truck,
  Wrench,
} from '@lucide/vue'
import QuoteModal from '~/components/QuoteModal.vue'
import LpContactButtons from '~/components/lp/LpContactButtons.vue'
import LpConsentBanner from '~/components/lp/LpConsentBanner.vue'
import LpWhatsAppPopup from '~/components/lp/LpWhatsAppPopup.vue'
import { useWhatsAppPopup } from '~/composables/useWhatsAppPopup'
import { captureAdClickId } from '~/utils/adClickId'
import { buildWhatsAppLink } from '~/utils/contactNumbers'
import { useContactShift } from '~/composables/useContactShift'
import { useAnalytics } from '~/composables/useAnalytics'
import { useAdsConversion } from '~/composables/useAdsConversion'

const config = useRuntimeConfig().public as Record<string, string | undefined>

// SEO: página de campanha — não indexar para não concorrer com a home
useHead({
  title: 'Conserto de Portão de Condomínio em até 6 Horas | A Portamóvel',
  meta: [
    {
      name: 'description',
      content:
        'Portão do condomínio quebrado ou aberto? Técnico no local em até 6 horas. Atendimento exclusivo para síndicos, zeladores e administradoras de condomínios na capital de São Paulo. Desde 1986.',
    },
    { name: 'robots', content: 'noindex, follow' },
  ],
  link: [{ rel: 'canonical', href: 'https://www.aportamovel.com.br/lp/condominios' }],
  script: config.googleAdsId
    ? [
        {
          // Consent Mode v2 (LGPD): tudo negado até o visitante aceitar no aviso de cookies
          innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}`
            + `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`
            + `try{if(localStorage.getItem('pm_consent')==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}`
            + `gtag('js',new Date());gtag('config','${config.googleAdsId}',{url_passthrough:true});`,
        },
        { src: `https://www.googletagmanager.com/gtag/js?id=${config.googleAdsId}`, async: true },
      ]
    : [],
})

const { contact, isPlantao } = useContactShift()

onMounted(() => captureAdClickId())
const { trackWhatsAppClick } = useAnalytics()
const { trackFormConversion } = useAdsConversion()
const { openWhatsAppPopup } = useWhatsAppPopup()

const isQuoteOpen = ref(false)
const quoteServiceName = ref('Manutenção de portões e gradis para condomínio')
const quoteServiceSlug = ref('manutencao-portoes-condominio')

function openQuote(name: string, slug: string) {
  quoteServiceName.value = name
  quoteServiceSlug.value = slug
  isQuoteOpen.value = true
}

function onQuoteSubmitted() {
  trackFormConversion()
}

const contractWhatsapp = computed(() =>
  buildWhatsAppLink(
    '5511912984416',
    'Olá! Gostaria de uma proposta de Contrato de Manutenção Preventiva Mensal para o meu condomínio.',
  ),
)

function onContractWhatsApp() {
  trackWhatsAppClick({ cta_location: 'lp_contract', channel_type: 'commercial', service_slug: 'contrato-manutencao-preventiva' })
  openWhatsAppPopup('lp_contract')
}

const trust = [
  { icon: BadgeCheck, title: 'Desde 1986', text: 'Mais de 40 anos atendendo condomínios' },
  { icon: Siren, title: 'Técnico em até 6 horas', text: 'Resposta de emergência para portão parado' },
  { icon: HardHat, title: 'Equipe própria', text: 'Técnicos registrados, uniformizados e treinados' },
  { icon: Truck, title: 'Só condomínios', text: 'Não atendemos residências avulsas' },
]

const problems = [
  'Portão não fecha e o condomínio fica exposto',
  'Portão não abre e prende moradores e entregas',
  'Portão fora do trilho ou travando',
  'Cabo de aço rompido ou desgastado',
  'Roldanas e trilhos quebrados',
  'Motor, corrente ou automação com defeito',
]

const services = [
  {
    title: 'Manutenção de portões',
    text: 'Corretiva e preventiva em portões de garagem e de pedestres, deslizantes e basculantes.',
    image: '/images/services/manutencao-portoes.webp',
    alt: 'Técnico fazendo manutenção em portão de condomínio',
    slug: 'manutencao-portoes-condominio',
  },
  {
    title: 'Troca de cabo de aço por kit de corrente',
    text: 'Substituição que aumenta a durabilidade e reduz paradas do portão.',
    image: '/images/services/kit-corrente-portao.webp',
    alt: 'Kit de corrente instalado em portão de condomínio',
    slug: 'kit-corrente-portao',
  },
  {
    title: 'Troca de trilhos e roldanas',
    text: 'Reparo de trilhos e roldanas duplas para portões pesados e de alto fluxo.',
    image: '/images/services/troca-trilhos.webp',
    alt: 'Troca de trilhos de portão de condomínio',
    slug: 'troca-trilhos-roldanas',
  },
  {
    title: 'Recuperação e repintura de gradis',
    text: 'Remoção de ferrugem, solda, reforço estrutural e pintura que renova a fachada.',
    image: '/images/services/recuperacao-gradis.webp',
    alt: 'Recuperação e repintura de gradil de condomínio',
    slug: 'recuperacao-repintura-gradis',
  },
]

const steps = [
  { title: 'Você nos aciona', text: 'Ligue ou chame no WhatsApp. Informe o endereço do condomínio e o problema.' },
  { title: 'Técnico no local em até 6 horas', text: 'Vamos até o condomínio, avaliamos e consertamos para o portão não ficar aberto.' },
  { title: 'Orçamento claro', text: 'Proposta detalhada para o síndico apresentar e aprovar com o condomínio.' },
  { title: 'Serviço executado', text: 'Equipe uniformizada resolve, deixa tudo funcionando e organizado.' },
]

const faqs = [
  {
    q: 'Vocês atendem apenas condomínios?',
    a: 'Sim. Atendemos somente condomínios prediais e residenciais, por meio de síndicos, zeladores e administradoras. Não atendemos casas ou residências avulsas.',
  },
  {
    q: 'Quais regiões vocês atendem?',
    a: 'Atendemos condomínios na capital de São Paulo, onde garantimos técnico em até 6 horas. Chame no WhatsApp e informe o endereço para confirmarmos.',
  },
  {
    q: 'Como funciona o atendimento de emergência?',
    a: 'Nosso técnico chega ao condomínio em até 6 horas após o seu chamado. Das 7h às 16h você fala com o atendimento comercial; a partir das 16h, com o plantão.',
  },
  {
    q: 'Vocês fazem orçamento antes de começar?',
    a: 'Sim. Fazemos a vistoria e apresentamos uma proposta clara, para o síndico e o conselho decidirem com segurança.',
  },
  {
    q: 'Existe contrato de manutenção mensal?',
    a: 'Sim. O contrato de manutenção preventiva prevê visitas programadas todos os meses para vistoria e ajustes, ajudando a evitar paradas inesperadas.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased pb-20 sm:pb-0">
    <!-- Header enxuto: sem menu para não tirar o visitante da página -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div class="h-1 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c]" />
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="A Portamóvel Serralheria">
          <img src="/images/logo.png" alt="A Portamóvel Serralheria" class="h-9 w-auto" width="36" height="36" />
          <span class="leading-none">
            <span class="block text-base sm:text-lg font-extrabold text-[#09357a]">A Portamóvel</span>
            <span class="block text-[10px] font-extrabold tracking-widest uppercase text-[#b91c1c] mt-0.5">Serralheria</span>
          </span>
        </NuxtLink>
        <div class="hidden sm:block">
          <LpContactButtons location="lp_header" layout="compact" :show-numbers="false" />
        </div>
        <span class="sm:hidden inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
          <span class="relative flex h-2 w-2">
            <span v-if="isPlantao" class="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 motion-safe:animate-ping" />
            <span class="relative inline-flex h-2 w-2 rounded-full" :class="isPlantao ? 'bg-red-600' : 'bg-emerald-500'" />
          </span>
          {{ contact.statusLabel }}
        </span>
      </div>
    </header>

    <main>
      <!-- HERO -->
      <section class="relative overflow-hidden bg-slate-50 border-b border-slate-200">
        <Wrench class="pointer-events-none absolute -right-10 -top-6 h-72 w-72 sm:h-[26rem] sm:w-[26rem] -rotate-12 text-slate-200/70" :stroke-width="1.25" aria-hidden="true" />
        <Cog class="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 sm:h-56 sm:w-56 text-slate-200/60" :stroke-width="1.25" aria-hidden="true" />
        <Hammer class="pointer-events-none absolute right-1/3 -bottom-8 hidden h-40 w-40 rotate-12 text-slate-200/50 lg:block" :stroke-width="1.25" aria-hidden="true" />

        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          <div class="max-w-2xl space-y-4 sm:space-y-5">
            <span class="inline-flex items-center gap-2 rounded-full bg-red-700 px-3 py-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.14em] text-white">
              <Building2 class="w-3.5 h-3.5" aria-hidden="true" />
              Só condomínios · Capital de SP
            </span>

            <h1 class="text-[28px] sm:text-5xl font-black leading-[1.08] tracking-tight text-[#09357a]">
              Portão do condomínio quebrado ou aberto?
              <span class="block text-red-700">Técnico no local em até 6 horas.</span>
            </h1>

            <p class="text-sm sm:text-lg text-slate-600 leading-relaxed">
              Para <strong class="text-slate-900">síndicos, zeladores e administradoras</strong>. Ligue, informe o endereço e enviamos a equipe. Desde 1986.
            </p>

            <LpContactButtons location="lp_hero" tone="light" />

            <p class="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold">
              <span class="relative flex h-2.5 w-2.5">
                <span v-if="isPlantao" class="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 motion-safe:animate-ping" />
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="isPlantao ? 'bg-red-600' : 'bg-emerald-500'" />
              </span>
              {{ contact.statusLabel }} · {{ contact.phoneDisplay }}
            </p>
          </div>
        </div>
      </section>

      <!-- PROVAS DE CONFIANÇA -->
      <section class="bg-white border-b border-slate-200" aria-label="Por que a Portamóvel">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="item in trust" :key="item.title" class="flex items-start gap-3">
            <span class="w-10 h-10 rounded-xl bg-blue-50 text-[#09357a] flex items-center justify-center shrink-0">
              <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p class="text-sm font-extrabold text-[#09357a] leading-tight">{{ item.title }}</p>
              <p class="text-xs text-slate-600 leading-snug mt-0.5">{{ item.text }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- EMERGÊNCIA -->
      <section id="emergencia" class="scroll-mt-20 bg-red-50 border-b border-red-100">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div class="space-y-4">
            <span class="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#b91c1c]">
              <Siren class="w-4 h-4" aria-hidden="true" /> Emergência
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Portão do condomínio não pode ficar aberto. Resolvemos hoje.
            </h2>
            <p class="text-sm sm:text-base text-slate-700 leading-relaxed">
              Portão que não fecha é risco de segurança; portão que não abre trava moradores e entregas.
              Chame agora: o técnico chega ao condomínio em até 6 horas.
            </p>
            <LpContactButtons location="lp_emergency" layout="stack" />
          </div>
          <div class="bg-white rounded-2xl border border-red-100 shadow-sm p-5 sm:p-6">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3">Resolvemos problemas como:</h3>
            <ul class="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
              <li v-for="p in problems" :key="p" class="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{{ p }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SERVIÇOS -->
      <section id="servicos" class="scroll-mt-20 bg-slate-50 py-12 sm:py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="max-w-2xl mb-8 sm:mb-10">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#09357a]">O que fazemos</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#09357a] mt-1.5 leading-tight">
              Manutenção e recuperação de portões e gradis de condomínio
            </h2>
            <div class="w-16 h-1 bg-[#b91c1c] rounded-full mt-3" />
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <article
              v-for="s in services"
              :key="s.slug"
              class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col"
            >
              <img :src="s.image" :alt="s.alt" class="h-40 w-full object-cover" loading="lazy" width="480" height="320" />
              <div class="p-4 sm:p-5 flex-1 flex flex-col">
                <h3 class="text-base font-extrabold text-[#09357a] leading-snug">{{ s.title }}</h3>
                <p class="text-sm text-slate-600 leading-relaxed mt-1.5 flex-1">{{ s.text }}</p>
                <button
                  type="button"
                  class="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#b91c1c] hover:text-[#991b1b] min-h-[44px] self-start"
                  @click="openQuote(s.title, s.slug)"
                >
                  Pedir orçamento <ArrowRight class="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- COMO FUNCIONA -->
      <section id="como-funciona" class="scroll-mt-20 bg-white py-12 sm:py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#09357a] text-center">Como funciona</h2>
          <ol class="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <li v-for="(step, i) in steps" :key="step.title" class="relative rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span class="w-9 h-9 rounded-full bg-[#09357a] text-white font-extrabold flex items-center justify-center text-sm">{{ i + 1 }}</span>
              <h3 class="mt-3 text-base font-extrabold text-slate-900">{{ step.title }}</h3>
              <p class="mt-1 text-sm text-slate-600 leading-relaxed">{{ step.text }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- FROTA PRÓPRIA -->
      <section class="bg-slate-50 py-12 sm:py-16" aria-label="Frota própria">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div class="text-center space-y-2">
            <p class="text-xs font-bold uppercase tracking-wider text-blue-600">Equipe e veículos próprios</p>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#09357a] leading-tight">
              Por isso chegamos rápido: a frota é nossa
            </h2>
            <p class="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Veículos e motos próprios, com técnicos da casa, prontos para sair para o seu condomínio. Atendemos a capital de São Paulo desde 1986.
            </p>
          </div>
          <figure class="rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 bg-white">
            <img
              src="/images/real_fleet.jpg"
              alt="Frota de veículos e motos da A Portamóvel estacionada, com a identidade visual da empresa"
              class="w-full h-auto"
              width="1024"
              height="576"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <!-- CONTRATO PREVENTIVO -->
      <section class="bg-gradient-to-b from-slate-900 via-[#07285c] to-slate-900 text-white py-12 sm:py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Wrench class="w-3.5 h-3.5" aria-hidden="true" /> Manutenção preventiva
          </span>
          <h2 class="text-2xl sm:text-4xl font-black leading-tight">
            Não espere o portão parar para cuidar dele
          </h2>
          <p class="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
            Com o contrato mensal, o condomínio recebe visitas programadas para inspeção, acompanhamento e identificação
            de desgastes antes que virem uma parada, com mais previsibilidade para o orçamento e a rotina do condomínio.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#09357a] hover:bg-blue-50 font-extrabold px-6 py-3.5 min-h-[52px] shadow-lg"
              @click="openQuote('Contrato de Manutenção Preventiva', 'contrato-manutencao-preventiva')"
            >
              Receber proposta do contrato <ArrowRight class="w-4 h-4" aria-hidden="true" />
            </button>
            <a
              :href="contractWhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3.5 min-h-[52px] shadow-lg"
              @click.prevent="onContractWhatsApp"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="scroll-mt-20 bg-white py-12 sm:py-16">
        <div class="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#09357a] text-center">Perguntas frequentes</h2>
          <div class="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            <details v-for="f in faqs" :key="f.q" class="group py-4">
              <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-sm sm:text-base font-bold text-slate-900 min-h-[44px]">
                {{ f.q }}
                <span class="text-[#b91c1c] text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p class="mt-2 text-sm text-slate-600 leading-relaxed">{{ f.a }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- CTA FINAL -->
      <section class="bg-[#09357a] text-white py-12 sm:py-14">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <ShieldCheck class="w-10 h-10 mx-auto text-blue-200" aria-hidden="true" />
          <h2 class="text-2xl sm:text-3xl font-extrabold leading-tight">Portão do condomínio com problema?</h2>
          <p class="text-sm sm:text-base text-blue-100">Ligue agora e enviamos um técnico em até 6 horas.</p>
          <div class="max-w-xl mx-auto">
            <LpContactButtons location="lp_final" tone="dark" />
          </div>
          <button
            type="button"
            class="text-sm font-bold text-blue-200 hover:text-white underline underline-offset-4 min-h-[44px]"
            @click="openQuote('Manutenção de portões e gradis para condomínio', 'manutencao-portoes-condominio')"
          >
            Prefere que a gente ligue? Deixe seus dados
          </button>
        </div>
      </section>
    </main>

    <!-- Rodapé mínimo -->
    <footer class="bg-slate-900 text-slate-300 text-xs py-8 px-4 text-center space-y-2">
      <p class="font-bold text-white">A Portamóvel Serralheria · Desde 1986</p>
      <p class="flex items-center justify-center gap-1.5"><MapPin class="w-3.5 h-3.5" aria-hidden="true" /> Rua Manoel Ramos, 26 — Freguesia do Ó, São Paulo</p>
      <p class="flex items-center justify-center gap-1.5"><Clock class="w-3.5 h-3.5" aria-hidden="true" /> Técnico em até 6 horas · Atendimento comercial das 7h às 16h</p>
      <p class="flex items-center justify-center gap-3">
        <NuxtLink to="/" class="underline underline-offset-4 hover:text-white">Conheça o site completo</NuxtLink>
        <NuxtLink to="/politica-de-privacidade" class="underline underline-offset-4 hover:text-white">Política de privacidade</NuxtLink>
      </p>
    </footer>

    <!-- Barra fixa mobile: ligar / WhatsApp sempre à mão -->
    <div class="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-2" style="padding-bottom: calc(0.5rem + env(safe-area-inset-bottom))">
      <LpContactButtons location="lp_sticky" layout="row" :show-numbers="false" class="!flex-row" />
    </div>

    <LpConsentBanner />
    <LpWhatsAppPopup />

    <QuoteModal
      :is-open="isQuoteOpen"
      :service-name="quoteServiceName"
      :service-slug="quoteServiceSlug"
      @close="isQuoteOpen = false"
      @submitted="onQuoteSubmitted"
    />
  </div>
</template>
