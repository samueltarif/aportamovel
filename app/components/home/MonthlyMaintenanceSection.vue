<script setup lang="ts">
import { CalendarCheck, ShieldCheck, CheckCircle2, MessageSquare, ArrowRight, Clock, FileCheck } from '@lucide/vue'
import { useAnalytics } from '~/composables/useAnalytics'

const emit = defineEmits<{
  (e: 'request-quote', serviceName: string, serviceSlug: string): void
}>()

const { trackWhatsAppClick } = useAnalytics()

const benefits = [
  {
    title: 'Visitas Preventivas Mensais',
    description: 'Acompanhamento periódico programado no condomínio para vistoria e ajustes.',
  },
  {
    title: 'Identificação de Desgastes',
    description: 'Possibilidade de detectar sinais de desgaste antes que evoluam para paradas e problemas maiores.',
  },
  {
    title: 'Acompanhamento Contínuo',
    description: 'Histórico técnico e acompanhamento recorrente do estado dos portões e estruturas atendidas.',
  },
  {
    title: 'Manutenção Planejada',
    description: 'Mais previsibilidade e organização para planejar intervenções no momento adequado.',
  },
]

function handleQuoteClick() {
  emit('request-quote', 'Contrato de Manutenção Preventiva', 'contrato-manutencao-preventiva')
}

function handleWhatsAppClick() {
  trackWhatsAppClick({
    cta_location: 'maintenance_contract',
    channel_type: 'commercial',
    service_slug: 'contrato-manutencao-preventiva',
  })
  const text = encodeURIComponent('Olá! Gostaria de receber uma proposta de Contrato de Manutenção Preventiva Mensal para meu condomínio.')
  window.open(`https://wa.me/5511912984416?text=${text}`, '_blank')
}
</script>

<template>
  <section id="contrato-manutencao" class="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-[#07285c] to-slate-900 text-white relative overflow-hidden">
    <!-- Subtle Background Glow -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-[#b91c1c]/10 rounded-full blur-3xl pointer-events-none" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <!-- Coluna Esquerda: Conteúdo Comercial & Benefícios -->
        <div class="lg:col-span-7 space-y-6 sm:space-y-8">
          <!-- Eyebrow Badge -->
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <CalendarCheck class="w-3.5 h-3.5 text-blue-300" />
            <span>MANUTENÇÃO PREVENTIVA PARA CONDOMÍNIOS</span>
          </div>

          <!-- Título Principal -->
          <div class="space-y-3">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-tight">
              Contrato de Manutenção Mensal
            </h2>
            <p class="text-base sm:text-lg text-red-300 font-extrabold leading-snug">
              "Seu condomínio não precisa esperar o portão apresentar um problema para cuidar da manutenção."
            </p>
          </div>

          <!-- Copy Secundária -->
          <p class="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            Com o contrato de manutenção preventiva da <strong class="text-white font-bold">A Portamóvel</strong>, o condomínio recebe visitas programadas todos os meses para inspeção, acompanhamento e identificação preventiva de desgastes nos equipamentos e estruturas atendidas.
          </p>

          <!-- Grid dos 4 Benefícios -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(benefit, idx) in benefits"
              :key="idx"
              class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors space-y-1.5"
            >
              <div class="flex items-center space-x-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 class="font-bold text-white text-sm">
                  {{ benefit.title }}
                </h3>
              </div>
              <p class="text-xs text-blue-200/80 leading-relaxed pl-6.5">
                {{ benefit.description }}
              </p>
            </div>
          </div>

          <!-- Comparativo Compacto de Modelo Operacional -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-black/30 border border-white/10 text-xs">
            <div class="space-y-1 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-3">
              <span class="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                Atendimento Reativo (Sem Contrato)
              </span>
              <p class="text-slate-400 text-[11px] leading-relaxed">
                Atendimento acionado principalmente quando surge uma parada ou falha, com intervenções pontuais.
              </p>
            </div>
            <div class="space-y-1 sm:pl-3 pt-2 sm:pt-0">
              <span class="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">
                Com Contrato Preventivo Mensal
              </span>
              <p class="text-blue-200 text-[11px] leading-relaxed">
                Visitas mensais regulares, detecção antecipada de desgastes e planejamento de manutenções.
              </p>
            </div>
          </div>

          <!-- Linha de Confiança & Público-Alvo -->
          <div class="flex items-center space-x-2 text-xs text-blue-200/90 font-medium">
            <ShieldCheck class="w-4 h-4 text-blue-400 shrink-0" />
            <span>Atendimento especializado para condomínios residenciais e comerciais, síndicos e administradoras.</span>
          </div>

          <!-- Ações e CTAs -->
          <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <!-- CTA Principal: Solicitar Proposta -->
            <button
              type="button"
              class="inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-red-900/40 active:scale-[0.99] cursor-pointer"
              @click="handleQuoteClick"
            >
              <FileCheck class="w-4 h-4" />
              <span>Solicitar Proposta de Manutenção</span>
              <ArrowRight class="w-4 h-4" />
            </button>

            <!-- CTA Secundário: WhatsApp Comercial -->
            <button
              type="button"
              class="inline-flex items-center justify-center space-x-2 px-5 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer"
              @click="handleWhatsAppClick"
            >
              <MessageSquare class="w-4 h-4 text-emerald-400" />
              <span>Falar com a Equipe</span>
            </button>
          </div>
        </div>

        <!-- Coluna Direita: Imagem Real da Operação e Vistorias -->
        <div class="lg:col-span-5">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/15 group">
            <img
              src="/images/services/manutencao-portoes.webp"
              alt="Técnico da A Portamóvel realizando manutenção e vistoria preventiva em portão condominial"
              loading="lazy"
              decoding="async"
              class="w-full h-80 sm:h-[480px] object-cover object-center group-hover:scale-103 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
              <!-- Selo Flutuante -->
              <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#09357a]/90 backdrop-blur-xs border border-blue-400/40 text-blue-100 text-[11px] font-extrabold uppercase tracking-wider w-fit mb-2">
                <Clock class="w-3.5 h-3.5 text-blue-300" />
                <span>Visitas Periódicas Mensais</span>
              </div>
              <h4 class="text-white font-extrabold text-base sm:text-lg">
                Inspeção Técnica Contínua
              </h4>
              <p class="text-xs text-blue-200/90 mt-1 leading-relaxed">
                Técnicos uniformizados, registrados (CLT) e equipados com veículos de apoio direto no condomínio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
