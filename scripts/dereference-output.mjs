/**
 * 把门户产物 server/node_modules 中的软链换成真实目录。
 * Nitro 会把同一依赖链到 .nitro，服务器上的 Node 往往无法把这条链解析成包。
 */
import { cpSync, existsSync, lstatSync, readdirSync, realpathSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outputModules = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../apps/portal/.output/server/node_modules',
)

if (!existsSync(outputModules)) {
  console.error('[dereference] 未找到 .output/server/node_modules，请先执行门户构建')
  process.exit(1)
}

function materialize(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = lstatSync(path)
    if (stat.isSymbolicLink()) {
      const real = realpathSync(path)
      unlinkSync(path)
      cpSync(real, path, { recursive: true, dereference: true })
      continue
    }
    if (stat.isDirectory()) materialize(path)
  }
}

materialize(outputModules)
console.info('[dereference] 已展开 .output/server/node_modules 中的软链')
