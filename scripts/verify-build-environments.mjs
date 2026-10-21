/* global window -- Playwright 的浏览器端回调读取 Nuxt 公开配置。 */
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(new URL('../apps/portal/package.json', import.meta.url))
const { chromium } = require('@playwright/test')
const selected = process.argv.slice(2)
const environments = selected.length ? selected : ['test', 'staging', 'production']
assert.ok(environments.every(value => ['test', 'staging', 'production'].includes(value)))
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const escapeHtml = value =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
async function freePort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}

const browser = await chromium.launch({ headless: true })
try {
  for (const environment of environments) {
    const directory = realpathSync(mkdtempSync(resolve(tmpdir(), `academy-${environment}-`)))
    const expected = parseEnv(
      readFileSync(resolve(root, 'apps/portal', `.env.${environment}`), 'utf8'),
    )
    execFileSync('tar', [
      '-xzf',
      resolve(root, 'dist', `isport-academy-${environment}.tar.gz`),
      '-C',
      directory,
    ])
    const manifest = JSON.parse(readFileSync(resolve(directory, 'build-info.json'), 'utf8'))
    assert.equal(manifest.environment, environment)
    const pm2 = require(resolve(directory, 'ecosystem.config.cjs')).apps[0]
    assert.ok(!Object.keys(pm2.env).some(key => key.startsWith('NUXT_')))
    assert.equal(pm2.cwd, directory)
    const port = await freePort()
    const origin = `http://127.0.0.1:${port}`
    // 真正从无 .env、无 NUXT_*、无 workspace 依赖的解压目录启动。
    const cleanEnvironment = Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) => !key.startsWith('NUXT_') && !key.startsWith('NITRO_'),
      ),
    )
    const child = spawn(process.execPath, ['server/index.mjs'], {
      cwd: directory,
      env: {
        ...cleanEnvironment,
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: String(port),
        NITRO_HOST: '127.0.0.1',
        NITRO_PORT: String(port),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let logs = ''
    child.stdout.on('data', chunk => {
      logs += chunk
    })
    child.stderr.on('data', chunk => {
      logs += chunk
    })
    const get = path =>
      fetch(origin + path, {
        headers: { 'accept-language': 'zh-CN' },
        signal: AbortSignal.timeout(40000),
      })
    try {
      let ready = false
      for (let attempt = 0; attempt < 100; attempt++) {
        if (child.exitCode !== null) throw new Error(logs)
        try {
          if ((await get('/robots.txt')).ok) {
            ready = true
            break
          }
        } catch {
          /* 等待监听完成。 */
        }
        await delay(100)
      }
      assert.ok(ready, `${environment} starts without injected configuration`)
      const response = await get('/')
      assert.equal(response.status, 200)
      const html = await response.text()
      const backend = await (
        await fetch(`${expected.NUXT_API_BASE}/api/v1/home`, {
          headers: { 'x-locale': 'zh-CN' },
          signal: AbortSignal.timeout(15000),
        })
      ).json()
      assert.equal(backend.status, 200)
      const title = backend.data.featuredList[0]?.title
      assert.ok(title, 'live backend has featured content')
      assert.ok(
        html.includes(escapeHtml(title)),
        `${environment} SSR includes live backend content`,
      )
      const robots = await (await get('/robots.txt')).text()
      if (environment === 'production') {
        assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'))
        assert.ok(robots.includes('Sitemap: https://academy.dream-sports.cn/sitemap.xml'))
        const sitemap = await get('/sitemap.xml')
        assert.equal(sitemap.status, 200)
        assert.match(
          await sitemap.text(),
          /<loc>https:\/\/academy\.dream-sports\.cn\/resources<\/loc>/,
        )
      } else {
        assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'))
        assert.ok(robots.split('\n').includes('Disallow: /'))
        assert.equal((await get('/sitemap.xml')).status, 404)
      }
      const page = await browser.newPage()
      try {
        await page.goto(origin)
        const config = await page.evaluate(() => window.useNuxtApp().$config.public)
        assert.equal(config.siteEnv, expected.NUXT_PUBLIC_SITE_ENV)
        assert.equal(config.apiBase, expected.NUXT_PUBLIC_API_BASE)
        assert.equal(config.documentPreviewBase, expected.NUXT_PUBLIC_DOCUMENT_PREVIEW_BASE)
      } finally {
        await page.close()
      }
      console.info(
        `[verify] ${environment}：压缩包独立解压启动、真实后端 SSR、浏览器配置、收录策略通过，无 NUXT_* 注入。`,
      )
    } catch (error) {
      console.error(logs.slice(-3000))
      throw error
    } finally {
      child.kill('SIGTERM')
      if (child.exitCode === null) await Promise.race([once(child, 'exit'), delay(3000)])
      if (child.exitCode === null) {
        child.kill('SIGKILL')
        await once(child, 'exit')
      }
      rmSync(directory, { recursive: true, force: true })
    }
  }
} finally {
  await browser.close()
}
