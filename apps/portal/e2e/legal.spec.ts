import { expect, test, waitForHydration } from './academy.fixture'

const documents = [
  {
    kind: 'terms',
    title: '用户协议',
    chapters: 12,
    lastClause: '12.6 您和公司均是独立的主体',
  },
  {
    kind: 'privacy',
    title: '隐私协议',
    chapters: 8,
    lastClause: '8.2 本隐私政策更新后',
  },
] as const

for (const prefix of ['', '/en']) {
  for (const agreement of documents) {
    test(`${prefix || '中文'} ${agreement.title} 直出完整 HTML 正文并适配手机`, async ({
      page,
    }) => {
      const response = await page.goto(`${prefix}/legal/${agreement.kind}`)
      expect(response?.status()).toBe(200)
      const html = (await response!.text()).replace(/\s+/g, ' ')
      expect(html).toContain(agreement.lastClause)
      expect(html).not.toContain('本页为演示文本')
      expect(html).not.toContain('This is demonstration text')
      await waitForHydration(page)
      const article = page.locator('.legal-document article')
      const body = article.locator('.legal-document__body')
      await expect(article).toHaveAttribute('lang', 'zh-CN')
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(agreement.title)
      await expect(body.getByRole('heading', { level: 2 })).toHaveCount(agreement.chapters)
      await expect(body).toContainText('更新日期：2026年10月20日')
      await expect(body).toContainText('生效日期：2026年10月25日')
      await expect(body.locator('strong').first()).toBeVisible()
      await expect(body.locator('iframe, object, embed')).toHaveCount(0)
      if (prefix) {
        await expect(article.locator('[lang="en"]')).toHaveText(
          'This agreement is provided in Chinese.',
        )
      }
      await page.setViewportSize({ width: 320, height: 844 })
      await expect(body.getByRole('heading', { level: 2 }).first()).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await body.locator('p').last().scrollIntoViewIfNeeded()
      await expect(body.locator('p').last()).toContainText(agreement.lastClause)
    })
  }

  test(`${prefix || '中文'} 登录协议入口打开正文且不自动勾选同意`, async ({ page }) => {
    await page.goto(prefix || '/')
    await waitForHydration(page)
    await page.locator('.app-header__login').click()
    const dialog = page.getByRole('dialog')
    for (const agreement of documents) {
      const link = dialog.locator(`a[href="${prefix}/legal/${agreement.kind}"]`)
      await expect(link).toHaveAttribute('target', '_blank')
      const popupPromise = page.waitForEvent('popup')
      await link.click()
      const popup = await popupPromise
      await expect(popup.locator('.legal-document h1')).toHaveText(agreement.title)
      await popup.close()
    }
    await expect(dialog.getByRole('checkbox')).not.toBeChecked()
    await expect(dialog).toBeVisible()
  })

  test(`${prefix || '中文'} 未知协议返回 404`, async ({ request }) => {
    expect((await request.get(`${prefix}/legal/unknown`)).status()).toBe(404)
  })
}
