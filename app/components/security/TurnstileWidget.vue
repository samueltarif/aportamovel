<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  action: 'contact_form' | 'quote_modal'
}>()

const emit = defineEmits<{
  (e: 'verify', token: string): void
  (e: 'expire'): void
  (e: 'error'): void
}>()

const config = useRuntimeConfig()
const siteKey = config.public?.turnstileSiteKey || ''

const widgetContainer = ref<HTMLElement | null>(null)
let widgetId: string | null = null

const renderWidget = () => {
  if (!siteKey || !widgetContainer.value || typeof window === 'undefined') return
  const turnstile = (window as any).turnstile
  if (!turnstile || typeof turnstile.render !== 'function') return

  if (widgetId) {
    try {
      turnstile.remove(widgetId)
    }
    catch {
      // Ignora erro de remoção prévia
    }
  }

  try {
    widgetId = turnstile.render(widgetContainer.value, {
      sitekey: siteKey,
      action: props.action,
      theme: 'light',
      callback: (token: string) => {
        emit('verify', token)
      },
      'expired-callback': () => {
        emit('expire')
      },
      'error-callback': () => {
        emit('error')
      },
    })
  }
  catch {
    emit('error')
  }
}

const reset = () => {
  if (widgetId && typeof window !== 'undefined') {
    const turnstile = (window as any).turnstile
    if (turnstile && typeof turnstile.reset === 'function') {
      try {
        turnstile.reset(widgetId)
      }
      catch {
        // Ignora
      }
    }
  }
}

defineExpose({
  reset,
  isConfigured: !!siteKey,
})

onMounted(() => {
  if (!siteKey) return

  if (typeof window !== 'undefined' && (window as any).turnstile) {
    renderWidget()
  }
  else {
    const existingScript = document.getElementById('cf-turnstile-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = () => {
        renderWidget()
      }
      document.head.appendChild(script)
    }
    else {
      existingScript.addEventListener('load', renderWidget)
    }
  }
})

onUnmounted(() => {
  if (widgetId && typeof window !== 'undefined') {
    const turnstile = (window as any).turnstile
    if (turnstile && typeof turnstile.remove === 'function') {
      try {
        turnstile.remove(widgetId)
      }
      catch {
        // Ignora
      }
    }
  }
})
</script>

<template>
  <div class="turnstile-wrapper my-2">
    <div v-if="siteKey" ref="widgetContainer" class="flex justify-center" />
    <div v-else class="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 text-center">
      Proteção anti-spam não configurada neste ambiente.
    </div>
  </div>
</template>
