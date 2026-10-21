/** 按构建环境归档部署目录及压缩包，保留其他环境的产物。 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = resolve(root, 'apps/portal/.output')
const manifest = resolve(outputDir, 'build-info.json')
if (!existsSync(manifest))
  throw new Error(
    '未找到构建环境信息，请先执行 pnpm build:test、pnpm build:staging 或 pnpm build:prod',
  )
const { environment } = JSON.parse(readFileSync(manifest, 'utf8'))
if (!['test', 'staging', 'production'].includes(environment)) throw new Error('无法识别构建环境')
if (process.argv[2] && process.argv[2] !== environment)
  throw new Error('构建产物与目标环境不一致，请重新构建')

const distDir = resolve(root, 'dist', environment)
const archive = resolve(root, 'dist', `isport-academy-${environment}.tar.gz`)
mkdirSync(resolve(root, 'dist'), { recursive: true })
rmSync(distDir, { recursive: true, force: true })
cpSync(outputDir, distDir, { recursive: true })
execFileSync('tar', ['-czf', archive, '-C', distDir, '.'])
console.info(`[release] ${environment} 部署目录：${distDir}`)
console.info(`[release] 部署压缩包：${archive}`)
console.info(`[release] 启动命令：node dist/${environment}/server/index.mjs`)
