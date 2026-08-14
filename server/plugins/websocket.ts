import WebSocket from 'ws'

/**
 * Polyfill de WebSocket para Node.js < 22 no servidor Nitro.
 * Permite que o cliente Supabase funcione em SSR no Node 20 sem erros de WebSocket.
 */
export default defineNitroPlugin(() => {
  if (typeof globalThis.WebSocket === 'undefined') {
    // @ts-expect-error ws is compatible with global WebSocket in Node runtime
    globalThis.WebSocket = WebSocket
  }
})
