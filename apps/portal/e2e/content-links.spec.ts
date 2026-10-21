import type { Locator, Page } from '@playwright/test'
import { expect, test, waitForHydration, returnFromBackground } from './academy.fixture'

async function openExternal(page: Page, link: Locator, url: string) {
  const currentUrl = page.url()
  await expect(link).toHaveAttribute('target', '_blank')
  const popupPromise = page.waitForEvent('popup')
  await link.click()
  const popup = await popupPromise
  await popup.waitForURL(url)
  expect(await popup.evaluate(() => window.opener === null)).toBe(true)
  expect(page.url()).toBe(currentUrl)
  await popup.close()
}

for (const path of ['/', '/en']) {
  test(`${path} 首页所有 LINK 入口直接打开 jumpUrl，普通内容仍走详情页`, async ({
    page,
    context,
  }) => {
    await context.route('https://example.com/**', route => route.fulfill({ body: 'External page' }))
    await page.goto(path)
    await waitForHydration(page)
    await page.route('**/api/v1/home', async route => {
      const response = await route.fetch()
      const envelope = await response.json()
      const home = envelope.data
      for (const field of ['featuredList', 'hotList', 'researchList', 'schoolList', 'newsList']) {
        home[field] = [
          {
            ...(home[field][0] ?? home.featuredList[0]),
            ...(field === 'schoolList' ? { channel: 'SCHOOL' } : {}),
            detailType: 'LINK',
            jumpUrl: `https://example.com/${field}`,
          },
        ]
      }
      home.resourceGroupList[0].itemList = [
        {
          ...home.resourceGroupList[0].itemList[0],
          detailType: 'LINK',
          jumpUrl: 'https://example.com/resources',
        },
      ]
      await route.fulfill({ response, json: envelope })
    })
    await returnFromBackground(page)
    const selectors = [
      ['.home-featured__copy a', 'featuredList'],
      ['.home-featured__hot li a', 'hotList'],
      ['.home-research__feature a', 'researchList'],
      ['.home-schools__card', 'schoolList'],
      ['.home-news__card', 'newsList'],
      ['.home-resources li a', 'resources'],
    ]
    for (const [selector, name] of selectors) {
      const link = page.locator(selector!).first()
      const url = `https://example.com/${name}`
      await expect(link).toHaveAttribute('href', url)
      await openExternal(page, link, url)
    }
    await page.goto(path === '/' ? '/resources' : '/en/resources')
    await waitForHydration(page)
    const article = page.locator('[data-content-id="RESOURCE:1"] a')
    await expect(article).not.toHaveAttribute('target', '_blank')
    await article.click()
    await expect(page).toHaveURL(
      path === '/' ? '/preview/article/resources/1' : '/en/preview/article/resources/1',
    )
  })
}

for (const channel of ['resources', 'research', 'schools']) {
  test(`${channel} LINK 卡片缺少 jumpUrl 时在新标签页加载详情后跳转`, async ({ page, context }) => {
    await context.route('https://example.com/**', route => route.fulfill({ body: 'External page' }))
    await page.goto(`/${channel}${channel === 'resources' ? '' : '?page=2'}`)
    await waitForHydration(page)
    const link = page
      .locator('.content-card')
      .filter({ has: page.getByRole('heading', { name: '资源示例 7', exact: true }) })
      .getByRole('link')
    await expect(link).toHaveAttribute('href', `/outbound/${channel}/7`)
    const detail = context.waitForEvent(
      'request',
      request => new URL(request.url()).pathname === `/api/v1/${channel}/7`,
    )
    await openExternal(page, link, 'https://example.com/lesson')
    await detail
  })
}

for (const failure of ['unavailable', 'unsafe'] as const) {
  test(`外链详情 ${failure} 时在新标签页显示错误及重试入口`, async ({ page, context }) => {
    await context.route('**/api/v1/research/7', route =>
      failure === 'unavailable'
        ? route.fulfill({ status: 503, json: { status: 503, message: 'Unavailable', data: null } })
        : route.fetch().then(async response => {
            const envelope = await response.json()
            envelope.data.jumpUrl = 'javascript:alert(1)'
            await route.fulfill({ response, json: envelope })
          }),
    )
    await page.goto('/research?page=2')
    await waitForHydration(page)
    const currentUrl = page.url()
    const link = page
      .locator('.content-card')
      .filter({ has: page.getByRole('heading', { name: '资源示例 7', exact: true }) })
      .getByRole('link')
    const popupPromise = page.waitForEvent('popup')
    await link.click()
    const popup = await popupPromise
    await expect(popup.getByRole('heading')).toHaveText('外部链接暂不可用，请稍后重试')
    await expect(popup.getByRole('button', { name: /重\s*试/ })).toBeVisible()
    expect(popup.url()).toContain('/outbound/research/7')
    expect(page.url()).toBe(currentUrl)
    await popup.close()
  })
}

test('外链加载提示服务端直出，不等待详情接口', async ({ request }) => {
  const response = await request.get('/outbound/research/7')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('正在打开外部内容')
  expect(html).toContain('/home/figma/5aa99.svg')
  expect(html).toContain('noindex, nofollow, noarchive')
})

test('详情接口慢时新标签页显示加载提示，取得地址后跳转，原页面保持不变', async ({
  page,
  context,
}) => {
  let release!: () => void
  const waiting = new Promise<void>(resolve => {
    release = resolve
  })
  await context.route('**/api/v1/research/7', async route => {
    await waiting
    await route.continue()
  })
  await context.route('https://example.com/**', route => route.fulfill({ body: 'External page' }))
  await page.goto('/research?page=2')
  await waitForHydration(page)
  const currentUrl = page.url()
  const link = page
    .locator('.content-card')
    .filter({ has: page.getByRole('heading', { name: '资源示例 7', exact: true }) })
    .getByRole('link')
  const popupPromise = page.waitForEvent('popup')
  await link.click()
  const popup = await popupPromise
  try {
    await expect(popup).toHaveURL(/\/outbound\/research\/7$/)
    await expect(popup.getByRole('heading', { name: '正在打开外部内容' })).toBeVisible()
    await expect(popup.getByRole('status')).toContainText('加载中')
    expect(await popup.evaluate(() => window.opener === null)).toBe(true)
    expect(page.url()).toBe(currentUrl)
    release()
    await expect(popup).toHaveURL('https://example.com/lesson')
  } finally {
    release()
    await context.unrouteAll({ behavior: 'wait' })
    await popup.close()
  }
})

test('行业动态外链加载失败后可在新标签页重试', async ({ page, context }) => {
  let fail = true
  await context.route('**/api/v1/news/1', async route => {
    if (fail) {
      await route.fulfill({
        status: 503,
        json: { status: 503, message: 'Unavailable', data: null },
      })
      return
    }
    const response = await route.fetch()
    const envelope = await response.json()
    envelope.data.detailType = 'LINK'
    envelope.data.jumpUrl = 'https://example.com/news'
    await route.fulfill({ response, json: envelope })
  })
  await context.route('https://example.com/**', route => route.fulfill({ body: 'External news' }))
  await page.goto('/outbound/news/1')
  await expect(page.getByRole('heading')).toHaveText('外部链接暂不可用，请稍后重试')
  fail = false
  await page.getByRole('button', { name: /重\s*试/ }).click()
  await expect(page).toHaveURL('https://example.com/news')
})

test('快速双击外链只打开一个新标签页', async ({ page, context }) => {
  await context.route('https://example.com/**', route => route.fulfill({ body: 'External page' }))
  await page.goto('/research?page=2')
  await waitForHydration(page)
  const link = page
    .locator('.content-card')
    .filter({
      has: page.getByRole('heading', { name: '资源示例 7', exact: true }),
    })
    .getByRole('link')
  const popupPromise = page.waitForEvent('popup')
  await link.dblclick()
  const popup = await popupPromise
  await expect(popup).toHaveURL('https://example.com/lesson')
  expect(context.pages()).toHaveLength(2)
  await expect(page).toHaveURL(/\/research\?category=SERIES&page=2$/)
  await popup.close()
})
