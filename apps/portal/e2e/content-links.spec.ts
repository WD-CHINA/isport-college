import type { Locator, Page } from '@playwright/test'
import { expect, test, waitForHydration, returnFromBackground } from './academy.fixture'

async function openExternal(page: Page, link: Locator, url: string) {
  const currentUrl = page.url()
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
  test(`${channel} LINK 卡片缺少 jumpUrl 时读取详情并在新窗口打开`, async ({ page, context }) => {
    await context.route('https://example.com/**', route => route.fulfill({ body: 'External page' }))
    await page.goto(`/${channel}${channel === 'resources' ? '' : '?page=2'}`)
    await waitForHydration(page)
    const link = page
      .locator('.content-card')
      .filter({ has: page.getByRole('heading', { name: '资源示例 7', exact: true }) })
      .getByRole('link')
    await expect(link).toHaveAttribute('href', '#')
    const detail = page.waitForRequest(`**/api/v1/${channel}/7`)
    await openExternal(page, link, 'https://example.com/lesson')
    await detail
  })
}

for (const failure of ['unavailable', 'unsafe'] as const) {
  test(`外链详情 ${failure} 时关闭空白窗口并显示提示`, async ({ page }) => {
    await page.route('**/api/v1/research/7', route =>
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
    await expect.poll(() => popup.isClosed()).toBe(true)
    await expect(page.locator('.ant-message')).toContainText('外部链接暂不可用，请稍后重试')
    expect(page.url()).toBe(currentUrl)
  })
}
