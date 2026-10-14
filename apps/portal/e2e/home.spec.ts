import { expect, test, switchLanguage, waitForHydration } from './academy.fixture'

test('首页服务端直出学校案例、行业动态及服务数据', async ({ request }) => {
  const response = await request.get('/', { headers: { 'Accept-Language': 'zh-CN' } })
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('class="home-schools"')
  expect(html).toContain('class="home-news"')
  expect(html).toContain('href="/news/1"')
  expect(html).toContain('43,000')
  expect(html).not.toContain('https://www.figma.com/api/mcp/asset/')
})

test('首页水平筛选展示对应接口分组，切回分类恢复原列表', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const resources = page.locator('.home-resources')
  await expect(resources).toContainText('资源示例 1')
  await resources.getByRole('combobox', { name: '推荐水平', exact: true }).click()
  await page.getByRole('option', { name: '水平三', exact: true }).click()
  await expect(resources).toContainText('资源示例 3')
  await expect(resources).not.toContainText('资源示例 1')
  await resources.getByRole('button', { name: '体能', exact: true }).click()
  await expect(resources.locator('.home-resources__level')).toContainText('全部学段')
  await expect(resources).toContainText('资源示例 1')
  await resources.getByRole('combobox', { name: '推荐水平', exact: true }).press('ArrowDown')
  await resources.getByRole('combobox').press('ArrowDown')
  await resources.getByRole('combobox').press('Enter')
  await expect(resources).toContainText('资源示例 3')
})

test('首页学段筛选无数据时显示空状态，语言切换与切回分类保持一致', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const resources = page.locator('.home-resources')
  await resources.getByRole('combobox', { name: '推荐水平', exact: true }).click()
  await page.getByRole('option', { name: '水平五', exact: true }).click()
  await expect(resources.locator('.home-resources__empty .ant-empty')).toContainText('暂无数据')
  await expect(resources.locator('li')).toHaveCount(0)
  await switchLanguage(page, 'en')
  await expect(resources.locator('.home-resources__empty .ant-empty')).toContainText('No data')
  await expect(
    resources.getByRole('combobox', { name: 'Recommended level', exact: true }),
  ).toBeVisible()
  await resources.getByRole('button', { name: 'Fitness', exact: true }).click()
  await expect(resources.locator('.home-resources__empty')).toHaveCount(0)
  await expect(resources).toContainText('Resource 1')
  await resources.getByRole('button', { name: 'Sports', exact: true }).click()
  await expect(resources.locator('.home-resources__empty .ant-empty')).toContainText('No data')
  await expect(resources.locator('li')).toHaveCount(0)
})

test('教研分类空状态可切换语言，未接入创作能力保持禁用', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const research = page.locator('.home-research')
  await research.getByRole('button', { name: '教研与专业发展', exact: true }).click()
  await expect(research.locator('.ant-empty')).toContainText('暂无数据')
  await expect(page.locator('.home-creation__entry')).toBeDisabled()
  await switchLanguage(page, 'en')
  await expect(research.locator('.ant-empty')).toContainText('No data')
  await expect(page.locator('.home-news')).toContainText('Industry news')
  await research.getByRole('button', { name: 'Teaching practice', exact: true }).click()
  await expect(research.locator('.home-research__feature')).toContainText('Resource 1')
})

for (const width of [320, 390]) {
  for (const path of ['/', '/en']) {
    test(`${width}px ${path} 首屏文案不被浮动能力栏遮挡`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(path)
      await waitForHydration(page)
      const lead = await page.locator('.home-hero__lead').boundingBox()
      const capabilities = await page.locator('.home-capabilities ul').boundingBox()
      expect(lead!.y + lead!.height).toBeLessThanOrEqual(capabilities!.y)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const login = await page.locator('.app-header__login').boundingBox()
      expect(login!.height).toBe(32)
    })
  }
}
