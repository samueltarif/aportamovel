<template>
  <section id="sobre" class="py-16 md:py-24 bg-[#09357a] text-white relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <!-- Coluna de Informações e Diferenciais -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
              <span>ESTRUTURA &amp; AGILIDADE</span>
            </div>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4">
              Frota Própria &amp; Sede Operacional
            </h2>
            <p class="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              Nossa capacidade de resposta é garantida por investimentos contínuos em infraestrutura própria de serralheria e veículos de apoio, sem terceirizações que comprometam a qualidade e o prazo do seu condomínio.
            </p>
          </div>

          <!-- Cards de Destaque -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Card 1: Veículos Equipados -->
            <div class="bg-blue-900/60 backdrop-blur-xs border border-blue-400/20 rounded-2xl p-4 hover:bg-blue-900/80 transition-all space-y-2">
              <div class="p-2 bg-blue-500/20 rounded-xl text-blue-300 w-fit">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <h3 class="font-bold text-white text-sm">Pronta-Resposta em Campo</h3>
              <p class="text-xs text-blue-200/80 leading-relaxed">
                Veículos próprios equipados com ferramentas, máquinas de solda e peças para intervenções imediatas.
              </p>
            </div>

            <!-- Card 2: Equipe CLT -->
            <div class="bg-blue-900/60 backdrop-blur-xs border border-blue-400/20 rounded-2xl p-4 hover:bg-blue-900/80 transition-all space-y-2">
              <div class="p-2 bg-blue-500/20 rounded-xl text-blue-300 w-fit">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z"/>
                </svg>
              </div>
              <h3 class="font-bold text-white text-sm">Equipe CLT Especializada</h3>
              <p class="text-xs text-blue-200/80 leading-relaxed">
                100% dos técnicos serralheiros registrados, uniformizados e treinados com foco em segurança predial.
              </p>
            </div>
          </div>

          <!-- Endereço e Contato da Sede -->
          <div class="p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs space-y-1.5 text-xs text-blue-100">
            <p class="font-bold text-white">📍 Sede Operacional em São Paulo:</p>
            <p class="text-blue-200">Rua Manoel Ramos, 26 - Jd. Maristela - Freguesia do Ó - São Paulo - SP</p>
            <p class="text-[11px] text-blue-300 pt-1">Tel: (11) 3991-0279 / 3991-0280 | WhatsApp Comercial: (11) 91298-4416</p>
          </div>
        </div>

        <!-- Coluna da Foto Real da Frota e Sede -->
        <div class="lg:col-span-6">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 group">
            <img
              src="/images/real_fleet.jpg"
              alt="A Portamóvel Instalações, Frota Própria e Sede Operacional"
              loading="lazy"
              class="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-103 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-6 flex flex-col justify-end">
              <span class="inline-block px-3 py-1 rounded-full bg-[#b91c1c] text-[10px] font-black uppercase tracking-wider text-white shadow-sm w-fit">
                Base Operacional
              </span>
              <p class="text-white font-extrabold text-base sm:text-lg mt-1 drop-shadow-sm">
                Instalações Próprias &amp; Veículos de Atendimento
              </p>
              <p class="text-xs text-gray-300 mt-0.5">
                Estrutura completa para atender condomínios em toda a Grande São Paulo com pontualidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
