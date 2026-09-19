/**
 * 由 tokens.ts 派生 css-vars.css 与 tokens.json，保证三者永远一致。
 * 运行：pnpm --filter @isport/design-tokens build
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '../src')
const { tokens } = await import(pathToFileURL(resolve(srcDir, 'tokens.ts')).href)

/** 将嵌套对象拍平为 [path[], value][] */
function flatten(value, path = []) {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, [...path, key]))
  }
  return [[path, value]]
}

const entries = flatten(tokens)

/** 生成 CSS 变量：--ic-color-brand-500 等形式 */
const lines = entries.map(([path, value]) => {
  const name = path
    .join('-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
  return `  --ic-${name}: ${value};`
})

const css = `/**
 * 本文件由 scripts/generate.mjs 根据 tokens.ts 自动生成，请勿手工修改。
 * 修改样式值请编辑 tokens.ts 后执行 pnpm --filter @isport/design-tokens build。
 */
:root {
${lines.join('\n')}
}
`

writeFileSync(resolve(srcDir, 'css-vars.css'), css, 'utf8')
writeFileSync(resolve(srcDir, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`, 'utf8')

console.info('[design-tokens] 已生成 css-vars.css 与 tokens.json')
