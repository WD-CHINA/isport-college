import { expect, test, waitForHydration } from './academy.fixture'

const channels = [
  ['resources', 'RESOURCE'],
  ['research', 'RESEARCH'],
  ['schools', 'SCHOOL'],
] as const
const types = [
  [1, 'ARTICLE', 'article', '.article-detail__reading'],
  [2, 'VIDEO', 'resource', '[data-testid="video-preview"]'],
  [3, 'AUDIO', 'resource', '[data-testid="audio-preview"]'],
  [4, 'DOCUMENT', 'resource', '[data-testid="document-preview"]'],
  [5, 'IMAGE', 'resource', '[data-testid="image-carousel"]'],
] as const

for (const [source, channel] of channels) {
  for (const [id, type, kind, selector] of types) {
    test(`${source} 的 ${type} 点击后进入公共预览并使用原栏目接口`, async ({ page }) => {
      const views: unknown[] = []
      page.on('request', request => {
        if (request.url().endsWith('/api/v1/contents/view')) views.push(request.postDataJSON())
      })
      await page.goto(`/${source}`)
      await waitForHydration(page)
      const link = page.locator(`[data-content-id="${channel}:${id}"] .content-card__link`)
      await expect(link).toHaveAttribute('href', `/preview/${kind}/${source}/${id}`)
      const detailRequest = page.waitForRequest(`**/api/v1/${source}/${id}`)
      await link.click()
      await detailRequest
      await expect(page).toHaveURL(`/preview/${kind}/${source}/${id}`)
      await expect(page.locator(selector)).toBeVisible()
      await expect(page.locator('.app-header__link--active')).toHaveAttribute('href', `/${source}`)
      await expect(
        page.getByRole('heading', { level: 1, name: `资源示例 ${id}`, exact: true }),
      ).toBeVisible()
      if (kind === 'resource') {
        await expect(page.locator('.resource-detail__breadcrumb a').last()).toHaveAttribute(
          'href',
          `/${source}`,
        )
      }
      await expect.poll(() => views).toEqual([{ channel, origin: 'PLATFORM', originId: id }])
      await expect(page.getByTestId('view-count')).toContainText('11')
    })
  }

  test(`${source} 公共预览 SSR 输出正文，英文水合不重复请求详情`, async ({ page }) => {
    const requests: string[] = []
    const errors: string[] = []
    page.on('request', request => {
      if (request.url().includes(`/api/v1/${source}/10`)) requests.push(request.url())
    })
    page.on('console', message => {
      if (/hydration.*mismatch/i.test(message.text())) errors.push(message.text())
    })
    const response = await page.goto(`/en/preview/article/${source}/10`)
    expect(response?.status()).toBe(200)
    expect(await response!.text()).toContain('文章详情布局回归正文。')
    await waitForHydration(page)
    await expect(page.locator('.article-detail__reading h1')).toHaveText('Resource 10')
    await expect(page.locator('.app-header__link--active')).toHaveAttribute('href', `/en/${source}`)
    await expect(page.getByTestId('view-count')).toContainText('11')
    expect(requests).toEqual([])
    expect(errors).toEqual([])
  })

  test(`${source} 旧详情路由与类型不匹配的预览地址直接返回 404`, async ({ request }) => {
    for (const path of [
      `/${source}/1`,
      `/en/${source}/5?from=history`,
      `/preview/article/${source}/5`,
      `/preview/resource/${source}/1`,
      `/preview/article/${source}/7`,
      `/preview/resource/${source}/7`,
    ]) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status()).toBe(404)
      expect(response.headers().location).toBeUndefined()
    }
  })
}

test('公共预览拒绝未知类型、未知栏目及不存在的内容', async ({ request }) => {
  for (const path of [
    '/courses/1',
    '/en/courses/5',
    '/preview/link/resources/1',
    '/preview/article/news/1',
    '/preview/resource/__proto__/1',
    '/preview/resource/schools/999',
    '/preview/article/research/invalid',
  ]) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
  }
})
