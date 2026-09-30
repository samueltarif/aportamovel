import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { parse, compileScript } from '@vue/compiler-sfc'
import ts from 'typescript'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const require = createRequire(import.meta.url)
function evaluate(source) {
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  new Function('require', 'exports', js)(require, exports)
  return exports
}
const filename = 'app/components/services/BeforeAfterViewer.vue'
const source = readFileSync(filename, 'utf8').replace(/import MediaPreview from [^\n]+/, 'const MediaPreview = { render: () => null }')
const { descriptor } = parse(source, { filename })
const component = evaluate(compileScript(descriptor, { id: 'gallery-test', inlineTemplate: true }).content).default
const media = { id: 'image-1', media_type: 'image', media_stage: 'general', url: '/photo.jpg', alt_text: 'nome-do-arquivo-original', caption: null }
const html = await renderToString(createSSRApp(component, { medias: [media], title: 'Obra' }))
assert.match(html, /alt="nome-do-arquivo-original"/)
assert.doesNotMatch(html, />\s*nome-do-arquivo-original\s*</)
const captionHtml = await renderToString(createSSRApp(component, { medias: [{ ...media, caption: 'Legenda escolhida' }], title: 'Obra' }))
assert.match(captionHtml, />\s*Legenda escolhida\s*</)
const { mediaUpdateSchema, mediaFinalizeSchema } = evaluate(readFileSync('server/validators/publicationSchemas.ts', 'utf8'))
assert.equal(mediaUpdateSchema.parse({ alt_text: 'Nova descrição', caption: '', media_stage: 'after' }).caption, '')
assert.equal(mediaUpdateSchema.safeParse({ alt_text: 'ab', caption: '', media_stage: 'general' }).success, false)
assert.equal(mediaUpdateSchema.safeParse({ alt_text: 'Foto', caption: '', media_stage: 'general', storage_key: 'arbitrary' }).success, false)
const id = '12345678-1234-4234-8234-123456789abc'
assert.equal(mediaFinalizeSchema.parse({ intent_id: id, replace_media_id: id, alt_text: 'Descrição preservada' }).replace_media_id, id)
console.log('PASS: alt acessível sem texto visível, legenda explícita e validação de edição/substituição.')
