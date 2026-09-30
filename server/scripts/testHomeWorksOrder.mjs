import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { parse, compileScript } from '@vue/compiler-sfc'
import ts from 'typescript'
import * as vue from 'vue'

const require = createRequire(import.meta.url)
const filename = 'app/components/admin/publications/HomeWorksOrder.vue'
const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
const script = compileScript(descriptor, { id: 'order-test' }).content
const js = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
globalThis.window = { addEventListener() {}, removeEventListener() {}, innerHeight: 800 }
globalThis.requestAnimationFrame = () => 1
globalThis.cancelAnimationFrame = () => {}
globalThis.getComputedStyle = () => ({ overflowY: 'auto' })
let calls = []
let fail = false
const publications = ['a', 'b', 'c'].map((id, index) => ({ id, title: id, service_id: 'service', status: 'published', display_order: index, published_at: null }))
const props = vue.reactive({ publications, services: [{ id: 'service', is_active: true }], loading: false })
const fetchMock = async (url, options) => {
  calls.push({ url, ...options })
  if (fail) throw new Error('offline')
  return options.body.publication_ids.map((id, index) => ({ ...publications.find(item => item.id === id), display_order: index }))
}
const exports = {}
new Function('require', 'exports', '$fetch', js)(name => name === 'vue' ? { ...vue, onBeforeUnmount() {} } : require(name), exports, fetchMock)
const state = exports.default.setup(props, { expose() {}, emit() {} })
state.list.value = {
  parentElement: { scrollTop: 0, getBoundingClientRect: () => ({ top: 0, bottom: 800 }) },
  children: [0, 1, 2].map(index => ({ getBoundingClientRect: () => ({ top: index * 100, bottom: (index + 1) * 100, height: 100 }) })),
}
const ids = () => state.works.value.map(item => item.id)
function event(pointerType, y) {
  return { pointerType, pointerId: 1, isPrimary: true, button: 0, clientX: 80, clientY: y, currentTarget: { setPointerCapture() {} }, preventDefault() {} }
}
for (const type of ['mouse', 'touch']) {
  state.works.value = [...publications]
  state.startDrag(event(type, 50), state.works.value[0])
  state.pointerMove(event(type, 270))
  assert.deepEqual(ids(), ['b', 'c', 'a'])
  await state.finishDrag(event(type, 270))
  assert.deepEqual(calls.at(-1).body.publication_ids, ['b', 'c', 'a'])
  assert.equal(state.saving.value, false)
}
state.works.value = [...publications]
const beforeCancel = calls.length
state.startDrag(event('touch', 50), state.works.value[0])
state.pointerMove(event('touch', 270))
state.cancelDrag()
assert.deepEqual(ids(), ['a', 'b', 'c'])
assert.equal(calls.length, beforeCancel)
fail = true
state.startDrag(event('mouse', 50), state.works.value[0])
state.pointerMove(event('mouse', 270))
await state.finishDrag(event('mouse', 270))
assert.deepEqual(ids(), ['a', 'b', 'c'])
assert.equal(state.failed.value, true)
fail = false
await state.keyboardMove({ key: 'ArrowDown', preventDefault() {} }, 0)
assert.deepEqual(ids(), ['b', 'a', 'c'])
await state.keyboardMove({ key: 'ArrowUp', preventDefault() {} }, 0)
assert.deepEqual(ids(), ['b', 'a', 'c'])
console.log('PASS: arrastar com mouse/toque, salvar ao soltar, cancelar, restaurar após falha e ordenar com teclado.')
