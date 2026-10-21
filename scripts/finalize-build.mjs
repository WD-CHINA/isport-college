/** 完成指定环境的可部署产物，不复制 .env 原文件。 */
import { copyFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const environment = process.argv[2]
if (!['test', 'staging', 'production'].includes(environment)) {
  throw new Error('构建环境必须为 test、staging 或 production')
}

await import('./dereference-output.mjs')
const portal = new URL('../apps/portal/', import.meta.url)
copyFileSync(
  new URL('ecosystem.config.cjs', portal),
  new URL('.output/ecosystem.config.cjs', portal),
)
writeFileSync(
  new URL('.output/build-info.json', portal),
  JSON.stringify({ environment, envFile: `.env.${environment}` }, null, 2) + '\n',
)
console.info(`[build] ${environment} 产物已生成：${fileURLToPath(new URL('.output/', portal))}`)
