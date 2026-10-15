import {
  expect,
  test,
  switchLanguage,
  waitForHydration,
  setSession,
  testSession,
  smsLogin,
} from './academy.fixture'
import type { Page } from '@playwright/test'

/** 只拦截当前浏览器的焦点刷新，为布局与字段回归提供完整内容。 */
async function populateHomeLayout(page: Page) {
  await page.route('**/api/v1/home', async route => {
    const response = await route.fetch()
    const envelope = await response.json()
    const home = envelope.data
    const resource = home.resourceGroupList[0].itemList[0]
    home.featuredList = [1, 2].map(id => ({
      ...resource,
      originId: id,
      contentKey: `RESOURCE:${id}`,
      title: `轮播精选 ${id}`,
    }))
    home.resourceGroupList[0].itemList = [
      { ...resource, levelName: '自定义水平', recommendedLevel: 2 },
      { ...resource, originId: 2, contentKey: 'RESOURCE:2', levelName: '', recommendedLevel: 3 },
      { ...resource, originId: 3, contentKey: 'RESOURCE:3', levelName: '', recommendedLevel: null },
    ]
    home.researchList = [1, 2, 3].map(id => ({
      ...home.researchList[0],
      originId: id,
      contentKey: `RESEARCH:${id}`,
    }))
    home.schoolList = [1, 2, 3].map(id => ({
      ...resource,
      channel: 'SCHOOL',
      originId: id,
      contentKey: `SCHOOL:${id}`,
    }))
    home.teacherList = [1, 2, 3, 4, 5, 6].map(id => ({ ...home.teacherList[0], id }))
    home.newsList = [1, 2, 3].map(id => ({ ...home.newsList[0], id }))
    await route.fulfill({ response, json: envelope })
  })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.locator('.home-research__side article')).toHaveCount(2)
  await expect(page.locator('.home-schools__card')).toHaveCount(3)
}

test('首页服务端直出学校案例、行业动态及服务数据', async ({ request }) => {
  const response = await request.get('/', { headers: { 'Accept-Language': 'zh-CN' } })
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('class="home-schools"')
  expect(html).toContain('class="home-news"')
  expect(html).toContain('href="/news/1"')
  expect(html).toContain('43,000')
  expect(html).toContain('适用：水平一')
  expect(html).not.toContain('适用：体能')
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
  await expect(resources.locator('.home-resources__body small')).toHaveText('适用：水平三')
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

test('教研分类空状态可切换语言', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const research = page.locator('.home-research')
  await research.getByRole('button', { name: '教研与专业发展', exact: true }).click()
  await expect(research.locator('.ant-empty')).toContainText('暂无数据')
  await expect(page.getByRole('heading', { name: '教师共创精选' })).toHaveCount(0)
  await switchLanguage(page, 'en')
  await expect(research.locator('.ant-empty')).toContainText('No data')
  await expect(page.locator('.home-news')).toContainText('Industry news')
  await research.getByRole('button', { name: 'Teaching practice', exact: true }).click()
  await expect(research.locator('.home-research__feature')).toContainText('Resource 1')
})

test('首页教研分类切换时，图标与文字同步激活和恢复默认颜色', async ({ page }) => {
  await page.goto('/')
  await waitForHydration(page)
  const buttons = page.locator('.home-research__nav button')
  for (let selected = 0; selected < (await buttons.count()); selected++) {
    await buttons.nth(selected).click()
    for (let index = 0; index < (await buttons.count()); index++) {
      const active = index === selected
      const button = buttons.nth(index)
      const icon = button.locator('.home-research__icon')
      const color = active ? 'rgb(0, 119, 250)' : 'rgb(28, 31, 35)'
      await expect(button).toHaveAttribute('aria-pressed', String(active))
      await expect(button).toHaveCSS('color', color)
      await expect(icon).toHaveCSS('background-color', color)
      await expect(icon).toHaveCSS('opacity', active ? '1' : '0.8')
      await expect(icon).toHaveCSS('mask-image', /research-.*\.svg/)
    }
  }
})

for (const [path, numericLabel] of [
  ['/', '适用：水平三'],
  ['/en', 'For: Level 3'],
] as const) {
  test(`${path} 首页适用信息优先使用名称，回退水平编号，未知水平不展示`, async ({ page }) => {
    await page.goto(path)
    await waitForHydration(page)
    await populateHomeLayout(page)
    const cards = page.locator('.home-resources__body')
    await expect(cards.nth(0).locator('small')).toHaveText(
      path === '/' ? '适用：自定义水平' : 'For: 自定义水平',
    )
    await expect(cards.nth(1).locator('small')).toHaveText(numericLabel)
    await expect(cards.nth(2).locator('small')).toHaveCount(0)
  })
}

test('1440px 首页教研、教师和学校卡片尺寸符合 Ardot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await waitForHydration(page)
  await populateHomeLayout(page)
  const feature = await page.locator('.home-research__feature').boundingBox()
  const photo = await page.locator('.home-research__photo').boundingBox()
  const copy = await page.locator('.home-research__feature > div').boundingBox()
  expect(feature!.width).toBeCloseTo(720, 0)
  expect(photo!.width).toBe(304)
  expect(photo!.height).toBe(304)
  expect(copy!.x - photo!.x - photo!.width).toBe(24)
  for (const card of await page.locator('.home-people__card').all()) {
    expect((await card.boundingBox())!.height).toBe(236)
  }
  await expect(page.locator('.home-schools__cover').first()).toHaveCSS('border-radius', '6px')
})

for (const width of [320, 390, 675, 767]) {
  test(`${width}px 首页内容支持轮播，资源保持双列且切回桌面布局正常`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: 844 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await waitForHydration(page)
    await populateHomeLayout(page)
    for (const section of ['.home-featured', '.home-people', '.home-schools', '.home-news']) {
      const carousel = page.locator(`${section} .home-swiper`)
      const element = carousel.locator('swiper-container')
      await expect
        .poll(() =>
          element.evaluate(node => Boolean((node as HTMLElement & { swiper?: unknown }).swiper)),
        )
        .toBe(true)
      await expect(carousel.getByRole('button')).toHaveCount(
        await carousel.locator('.home-swiper__dots button').count(),
      )
      await carousel.getByRole('button', { name: '第 2 页', exact: true }).click()
      await expect(carousel.getByRole('button', { name: '第 2 页', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await carousel.getByRole('button', { name: '第 1 页', exact: true }).click()
      await expect(carousel.getByRole('button', { name: '第 1 页', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
    const rows = page.locator('.home-resources li')
    const first = await rows.nth(0).boundingBox()
    const second = await rows.nth(1).boundingBox()
    expect(first!.y).toBe(second!.y)
    expect(second!.x).toBeGreaterThan(first!.x)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    const spotlight = page.locator('.home-featured .home-swiper')
    const cover = await spotlight.locator('.home-featured__cover').first().boundingBox()
    const card = await spotlight.locator('.home-featured__spotlight').first().boundingBox()
    expect(cover!.width).toBeCloseTo(card!.width - 32, 0)
    expect(cover!.x - card!.x).toBeCloseTo(16, 0)
    if (width === 390) {
      const schoolSlider = page.locator('.home-schools swiper-container')
      await schoolSlider.scrollIntoViewIfNeeded()
      const bounds = (await schoolSlider.boundingBox())!
      await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + 80)
      await page.mouse.down()
      await page.mouse.move(bounds.x + bounds.width * 0.2, bounds.y + 80, { steps: 20 })
      await page.mouse.up()
      await expect(
        page.locator('.home-schools').getByRole('button', { name: '第 2 页', exact: true }),
      ).toHaveAttribute('aria-pressed', 'true')
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    await expect(page.locator('.home-people .home-swiper__dots button')).toHaveCount(2)
    const newsCarousel = page.locator('.home-news .home-swiper')
    await newsCarousel.getByRole('button', { name: '第 2 页', exact: true }).click()
    await expect(
      newsCarousel.getByRole('button', { name: '第 2 页', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(errors).toEqual([])
  })
}

test('精选轮播自动翻页，键盘聚焦后停止播放', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await waitForHydration(page)
  await populateHomeLayout(page)
  const carousel = page.locator('.home-featured .home-swiper')
  await expect(carousel.getByRole('button', { name: '第 2 页', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
    { timeout: 8000 },
  )
  await carousel.getByRole('button', { name: '第 1 页', exact: true }).focus()
  await expect
    .poll(() =>
      carousel
        .locator('swiper-container')
        .evaluate(
          node =>
            (node as HTMLElement & { swiper: { autoplay: { running: boolean } } }).swiper.autoplay
              .running,
        ),
    )
    .toBe(false)
})

for (const width of [320, 390]) {
  for (const path of ['/', '/en']) {
    test(`${width}px ${path} 首屏文案不被浮动能力栏遮挡`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(path)
      await waitForHydration(page)
      await populateHomeLayout(page)
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

test('已登录时首页灵跃四个工具入口在新窗口打开外部服务，当前页保持首页', async ({
  page,
  context,
  baseURL,
}) => {
  await setSession(context, testSession(), baseURL!)
  const target = 'https://lingyue.dream-sports.cn/'
  await context.route('https://lingyue.dream-sports.cn/**', route =>
    route.fulfill({ body: 'Lingyue service' }),
  )
  await page.goto('/')
  await waitForHydration(page)
  const panel = page.locator('.home-lingyue__panel')
  await expect(panel).not.toContainText('该功能暂未接入')
  const links = panel.getByRole('button')
  await expect(links).toHaveCount(4)
  for (const link of await links.all()) {
    const popupPromise = page.waitForEvent('popup')
    await link.click()
    const popup = await popupPromise
    await expect(popup).toHaveURL(target)
    expect(await popup.evaluate(() => window.opener === null)).toBe(true)
    await popup.close()
  }
  await expect(page).toHaveURL(/\/$/)
})

test('未登录点击灵跃先登录，成功后恢复打开外部服务', async ({ page, context }) => {
  await context.route('https://lingyue.dream-sports.cn/**', route =>
    route.fulfill({ body: 'Lingyue service' }),
  )
  await page.goto('/')
  await waitForHydration(page)
  await page.locator('.home-lingyue__panel').getByRole('button').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(context.pages()).toHaveLength(1)
  const popupPromise = page.waitForEvent('popup')
  await smsLogin(page)
  const popup = await popupPromise
  await expect(popup).toHaveURL('https://lingyue.dream-sports.cn/')
  expect(await popup.evaluate(() => window.opener === null)).toBe(true)
  await popup.close()
  await expect(page).toHaveURL(/\/$/)
})

test('灵跃四个入口均有登录门禁，取消后独立登录不会打开灵跃', async ({ page, context }) => {
  await page.goto('/')
  await waitForHydration(page)
  const panel = page.locator('.home-lingyue__panel')
  await expect(panel.getByRole('link')).toHaveCount(0)
  const buttons = panel.getByRole('button')
  await expect(buttons).toHaveCount(4)
  for (const button of await buttons.all()) {
    await button.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(context.pages()).toHaveLength(1)
    await page.locator('.ant-modal-close').click()
    await expect(page.getByRole('dialog')).toBeHidden()
  }
  await page.locator('.app-header__login').click()
  await smsLogin(page)
  await expect(page.locator('.app-header__user')).toBeVisible()
  expect(context.pages()).toHaveLength(1)
})
