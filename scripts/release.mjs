/**
 * 发布聚合脚本：将 apps/portal/.output 复制为根目录 dist（唯一部署目录）。
 * 用法：pnpm release（先执行 turbo build，再聚合产物）
 */
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = resolve(root, 'apps/portal/.output')
const distDir = resolve(root, 'dist')

if (!existsSync(outputDir)) {
  console.error('[release] 未找到 apps/portal/.output，请先执行 pnpm build')
  process.exit(1)
}

rmSync(distDir, { recursive: true, force: true })
cpSync(outputDir, distDir, { recursive: true })

console.info('[release] 已生成 dist/：')
console.info('  生产启动命令：NODE_ENV=production node dist/server/index.mjs')
