/* global document -- Playwright 的浏览器端回调使用 DOM。 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const site = 'https://academy.dream-sports.cn'
const apiBase = process.env.SEO_API_BASE || site
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function unusedPort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}
async function withServer(environment, backend, check) {
  const port = await unusedPort()
  const origin = `http://127.0.0.1:${port}`
  let logs = ''
  const child = spawn(process.execPath, ['apps/portal/.output/server/index.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(port),
      NITRO_HOST: '127.0.0.1',
      NITRO_PORT: String(port),
      NUXT_API_BASE: backend,
      NUXT_PUBLIC_API_BASE: '/',
      NUXT_PUBLIC_SITE_ENV: environment,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', chunk => {
    logs += chunk
  })
  child.stderr.on('data', chunk => {
    logs += chunk
  })
  const get = path =>
    fetch(origin + path, {
      redirect: 'manual',
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
        // 服务尚未监听，稍后继续检查。
      }
      await delay(100)
    }
    assert.ok(ready, 'server started')
    await check(get, origin)
  } catch (error) {
    console.error(logs.slice(-4000))
    throw error
  } finally {
    child.kill('SIGTERM')
    if (child.exitCode === null) await Promise.race([once(child, 'exit'), delay(3000)])
    if (child.exitCode === null) child.kill('SIGKILL')
  }
}
function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1]
}
function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => match[0])
}
function canonical(html) {
  const links = tags(html, 'link').filter(tag => attr(tag, 'rel') === 'canonical')
  assert.equal(links.length, 1, 'one canonical')
  return attr(links[0], 'href')
}
function meta(html, name) {
  return attr(tags(html, 'meta').find(tag => attr(tag, 'name') === name) || '', 'content') || ''
}

await withServer('production', apiBase, async (get, origin) => {
  const robots = await (await get('/robots.txt')).text()
  assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`))
  assert.ok(!robots.split('\n').includes('Disallow: /'))
  const publicPages = [
    '/',
    '/resources',
    '/research',
    '/schools',
    '/preview/resource/resources/905',
    '/preview/resource/research/29',
    '/preview/article/schools/23',
  ]
  const descriptions = new Map()
  for (const path of publicPages) {
    const response = await get(path)
    assert.equal(response.status, 200, path)
    assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'), `${path} HTTP indexable`)
    const html = await response.text()
    assert.ok(!meta(html, 'robots').includes('noindex'), `${path} meta indexable`)
    assert.equal(canonical(html), site + (path === '/' ? '/' : path), path)
    assert.ok(meta(html, 'description').length > 0, `${path} description`)
    assert.match(html, /<h1\b/, `${path} SSR H1`)
    descriptions.set(path, meta(html, 'description'))
    if (path === '/')
      assert.equal((html.match(/<title>(.*?)<\/title>/s)?.[1].match(/融梦学苑/g) || []).length, 1)
    if (path.startsWith('/preview/')) {
      const scripts = [
        ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
      ]
      const schemas = scripts.flatMap(match => JSON.parse(match[1])['@graph'] || [])
      assert.ok(
        schemas.some(schema => schema['@type'] === 'BreadcrumbList'),
        `${path} breadcrumbs`,
      )
      if (path.includes('/article/'))
        assert.ok(schemas.some(schema => schema['@type'] === 'Article'))
      if (path.includes('/research/29'))
        assert.ok(schemas.some(schema => schema['@type'] === 'VideoObject'))
    }
  }
  assert.equal(
    new Set(['/resources', '/research', '/schools'].map(path => descriptions.get(path))).size,
    3,
  )
  for (const [path, expected] of [
    ['/research?page=2&utm_source=seo', `${site}/research?page=2`],
    ['/en/schools', `${site}/en/schools`],
  ])
    assert.equal(canonical(await (await get(path)).text()), expected)
  const search = await get('/resources?keyword=体育')
  assert.equal(search.headers.get('x-robots-tag'), 'noindex, follow')
  assert.equal(meta(await search.text(), 'robots'), 'noindex, follow')
  for (const path of [
    '/account',
    '/en/ACCOUNT',
    '/creation',
    '/Admin/courses',
    '/en/ADMIN',
    '/lingyue/callback',
  ]) {
    const response = await get(path)
    assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'), path)
  }
  const missing = await get('/preview/article/schools/999999999')
  assert.equal(missing.status, 404)
  assert.ok(meta(await missing.text(), 'robots').includes('noindex'))
  const response = await get('/sitemap.xml')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /xml/)
  const xml = await response.text()
  assert.match(xml, /<urlset\b/)
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  assert.ok(urls.length > 100, 'real public content included')
  assert.equal(new Set(urls).size, urls.length, 'unique sitemap entries')
  for (const url of urls) {
    const parsed = new URL(url)
    assert.equal(parsed.origin, site)
    assert.equal(parsed.search, '')
    assert.ok(
      !/^\/(en\/)?(account|admin|creation|lingyue|api|viewer)(\/|$)/i.test(parsed.pathname),
      url,
    )
  }
  for (const path of [...publicPages, '/en/preview/article/schools/23', '/en/resources'])
    assert.ok(urls.includes(site + (path === '/' ? '/' : path)), path)
  assert.ok(!urls.includes(`${site}/preview/resource/research/31`), 'LINK excluded')
  const source = await (await get('/__sitemap__/urls')).json()
  assert.deepEqual(new Set(urls), new Set(source.map(entry => site + entry.loc)))
  // 浏览器请求仍转发到真实公开后端，验证水合及客户端导航后的 head 更新。
  const require = createRequire(new URL('../apps/portal/package.json', import.meta.url))
  const { chromium } = require('@playwright/test')
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    await page.route(`${origin}/api/**`, async route => {
      const requested = new URL(route.request().url())
      const response = await route.fetch({
        url: `${apiBase}${requested.pathname}${requested.search}`,
      })
      await route.fulfill({ response })
    })
    await page.goto(`${origin}/resources`)
    await page.waitForURL(url => url.searchParams.has('category'))
    await page.waitForFunction(expected => {
      const links = document.querySelectorAll('link[rel="canonical"]')
      return links.length === 1 && links[0].getAttribute('href') === expected
    }, `${site}/resources`)
    await page.locator('a[href="/schools"]').first().click()
    await page.waitForURL(`${origin}/schools`)
    await page.waitForFunction(
      expected =>
        document.querySelector('link[rel="canonical"]')?.getAttribute('href') === expected,
      `${site}/schools`,
    )
    await page.goto(`${origin}/preview/article/schools/23`)
    await page.waitForFunction(() => !!document.querySelector('script[type="application/ld+json"]'))
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1)
    assert.equal(await page.locator('meta[name="robots"]').count(), 0)
    await page.locator('a[href="/schools"]').first().click()
    await page.waitForURL(`${origin}/schools`)
    await page.waitForFunction(() => !document.querySelector('script[type="application/ld+json"]'))
    console.info('浏览器：水合、默认分类标准网址、跨栏目导航、详情结构化数据清理通过。')
  } finally {
    await browser.close()
  }
  console.info(
    `生产环境：7 个公开页面、元信息、结构化数据、隐私页限制通过；@nuxtjs/sitemap 输出 ${urls.length} 个唯一网址。`,
  )
})
await withServer('test', apiBase, async get => {
  assert.ok((await (await get('/robots.txt')).text()).split('\n').includes('Disallow: /'))
  const response = await get('/')
  assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'))
  assert.ok(meta(await response.text(), 'robots').includes('noindex'))
  for (const path of ['/sitemap.xml', '/sitemap_index.xml', '/__sitemap__/urls'])
    assert.equal((await get(path)).status, 404, path)
  console.info('测试环境：全站 noindex、robots 禁止抓取、站点地图 404 通过。')
})
const unavailablePort = await unusedPort()
await withServer('production', `http://127.0.0.1:${unavailablePort}`, async get => {
  assert.equal((await get('/sitemap.xml')).status, 503)
  console.info('上游不可用：站点地图返回 503，通过。')
})
