import { expect, test, waitForHydration } from './academy.fixture'

for (const width of [1440, 390]) {
  test(`${width}px 7141378377 首页与资源页切换分类都重置推荐水平`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await waitForHydration(page)
    const home = page.locator('.home-resources')
    const homeLevel = home.locator('.home-resources__level')
    await homeLevel.click()
    await page.locator('.ant-select-item-option[title="水平一"]').click()
    await expect(homeLevel).toContainText('水平一')
    await home.locator('.home-resources__categories button').nth(1).click()
    await expect(homeLevel).toContainText('全部水平')
    await home.locator('.home-resources__categories button').first().click()
    await expect(homeLevel).toContainText('全部水平')
    await home.locator('.home-section-title a').click()
    await expect(page).toHaveURL(/\/resources\?category=1$/)
    const level = page.locator('.content-filters__field .ant-select').first()
    await level.click()
    await page.locator('.ant-select-item-option[title="水平 1"]').click()
    await expect(page).toHaveURL(/recommendedLevel=1/)
    await page.locator('.content-filters__categories button').nth(1).click()
    await expect(page).toHaveURL(/\/resources\?category=2$/)
    await expect(level).toContainText('全部')
    await page.locator('.content-filters__categories button').first().click()
    await expect(level).toContainText('全部')
  })

  test(`${width}px 7141906499 从体能搜索抢球游戏可命中其他分类的资源`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/resources?category=1')
    await waitForHydration(page)
    await page.route('**/api/v1/resources?**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('keyword') !== '抢球游戏') return route.continue()
      const sample = new URL(url)
      sample.searchParams.delete('keyword')
      const response = await route.fetch({ url: sample.href })
      const envelope = await response.json()
      // 模拟目标资源属于其他分类：带体能分类请求时无结果，全量搜索时可命中。
      const target = { ...envelope.data.list[0], title: '抢球游戏', categoryName: '基本技能' }
      const found = !url.searchParams.has('firstCategoryId')
      envelope.data = { total: found ? 1 : 0, pageNum: 1, pageSize: 8, list: found ? [target] : [] }
      await route.fulfill({ response, json: envelope })
    })
    const hero = page.locator('.catalog-hero')
    await hero.getByRole('searchbox').fill('抢球游戏')
    await hero.getByRole('button', { name: '搜索', exact: true }).click()
    await expect(page.locator('.content-card')).toHaveCount(1)
    await expect(page.locator('.content-card')).toContainText('抢球游戏')
    expect([...new URL(page.url()).searchParams.keys()]).toEqual(['keyword'])
    await expect(page.locator('.content-filters__categories [aria-pressed="true"]')).toHaveCount(0)
    await expect(page.locator('.content-list-feature__heading')).not.toContainText('体能资源')
  })
}
