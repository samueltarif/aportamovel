<script setup lang="ts">
// Texto-base de política de privacidade (LGPD — Lei 13.709/2018).
// Revisar com o responsável jurídico da empresa e completar o CNPJ e o e-mail do encarregado.
useHead({
  title: 'Política de Privacidade | A Portamóvel',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

const updatedAt = 'outubro de 2026'
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-slate-700">
    <h1 class="text-2xl sm:text-3xl font-extrabold text-[#09357a]">Política de Privacidade</h1>
    <p class="text-xs text-slate-500 mt-2">Atualizada em {{ updatedAt }}</p>

    <div class="mt-8 space-y-6 text-sm sm:text-base leading-relaxed">
      <section>
        <h2 class="text-lg font-extrabold text-slate-900">1. Quem somos</h2>
        <p class="mt-2">
          A Portamóvel Serralheria, com sede na Rua Manoel Ramos, 26, Freguesia do Ó, São Paulo/SP, é a controladora dos dados
          pessoais tratados neste site, nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </p>
      </section>

      <section>
        <h2 class="text-lg font-extrabold text-slate-900">2. Quais dados coletamos</h2>
        <ul class="mt-2 list-disc pl-5 space-y-1">
          <li>Dados que você informa nos formulários: nome, telefone, nome do condomínio e, opcionalmente, e-mail e mensagem.</li>
          <li>Dados de navegação: páginas visitadas, dispositivo, origem do acesso (inclusive identificador de clique em anúncio) e interações com botões.</li>
          <li>Conversas iniciadas por telefone ou WhatsApp.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-extrabold text-slate-900">3. Para que usamos</h2>
        <ul class="mt-2 list-disc pl-5 space-y-1">
          <li>Responder ao seu pedido de atendimento, vistoria ou orçamento (execução de contrato e procedimentos preliminares).</li>
          <li>Proteger o site contra fraudes e robôs (legítimo interesse).</li>
          <li>Medir o resultado dos nossos anúncios e melhorar o site, somente com o seu consentimento para cookies de anúncio e medição.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-extrabold text-slate-900">4. Com quem compartilhamos</h2>
        <p class="mt-2">
          Usamos fornecedores que tratam dados em nosso nome: hospedagem e banco de dados, proteção contra robôs (Cloudflare),
          análise de uso do site, Google (anúncios e medição de conversões) e WhatsApp (Meta), quando você escolhe falar por lá.
          Não vendemos dados pessoais.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-extrabold text-slate-900">5. Cookies</h2>
        <p class="mt-2">
          Cookies de anúncio e medição, incluindo o Microsoft Clarity (mapas de calor e gravação anônima de navegação, com mascaramento de dados sensíveis), só são ativados se você clicar em “Aceitar” no aviso de cookies. Você pode mudar a escolha
          a qualquer momento limpando os dados do site no seu navegador.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-extrabold text-slate-900">6. Por quanto tempo guardamos</h2>
        <p class="mt-2">
          Pelo tempo necessário para o atendimento e a relação comercial com o condomínio, e pelos prazos exigidos por lei.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-extrabold text-slate-900">7. Seus direitos</h2>
        <p class="mt-2">
          Você pode pedir confirmação, acesso, correção, anonimização, portabilidade ou exclusão dos seus dados e revogar o
          consentimento. Para isso, fale conosco pelo telefone (11) 3991-0280 ou pelo WhatsApp (11) 91298-4416.
        </p>
      </section>
    </div>
  </main>
</template>
