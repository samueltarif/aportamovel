<template>
  <section class="py-10 md:py-20 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <!-- Left Content -->
        <div class="lg:col-span-6 space-y-5 sm:space-y-6">
          <!-- Badge -->
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#09357a] text-xs font-bold uppercase tracking-wider">
            <svg class="w-4 h-4 fill-current text-[#09357a] flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span>Tradição &amp; Confiança</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Protegendo Condomínios desde <span class="text-[#09357a]">1986</span>.
          </h1>

          <!-- Description Paragraphs -->
          <div class="space-y-4 text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-normal">
            <p>
              A Aportamovel nasceu com o propósito de oferecer <strong class="font-bold text-gray-900">soluções completas em segurança e manutenção para condomínios</strong>.
            </p>
            <p>
              São quatro décadas de dedicação, evolução e parcerias sólidas, sempre com foco na <strong class="font-bold text-gray-900">qualidade, na agilidade e na valorização do patrimônio dos nossos clientes</strong>.
            </p>
            <p>
              Unimos experiência, tecnologia e uma equipe qualificada para entregar serviços que garantem mais segurança, funcionalidade e tranquilidade no dia a dia do seu condomínio.
            </p>
          </div>

          <!-- Red accent line -->
          <div class="w-16 h-1 bg-[#b91c1c] rounded-full pt-1 mt-4" aria-hidden="true" />
        </div>

        <!-- Right Image Column -->
        <div class="lg:col-span-6">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
            <img
              src="/images/headquarters.png"
              alt="A Portamóvel Serralheria - Uma trajetória construída com trabalho, dedicação e confiança"
              class="w-full h-64 sm:h-80 lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 text-white">
              <h3 class="font-extrabold text-xs sm:text-sm lg:text-base text-white tracking-wider uppercase leading-snug">
                UMA TRAJETÓRIA CONSTRUÍDA COM TRABALHO, DEDICAÇÃO E CONFIANÇA
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
