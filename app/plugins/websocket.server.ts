import WebSocket from 'ws'

export default defineNuxtPlugin(() => {
  if (typeof globalThis.WebSocket === 'undefined') {
    // @ts-expect-error WebSocket polyfill for Node runtime
    globalThis.WebSocket = WebSocket
  }
})
