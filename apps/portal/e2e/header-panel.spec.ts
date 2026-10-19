import { expect, test, setSession, testSession, waitForHydration } from './academy.fixture'

for (const width of [320, 994, 1440]) {
  for (const prefix of ['', '/en']) {
    test(`${width}px ${prefix || '中文'} 导航不提供语言切换入口`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      const response = await page.goto(`${prefix}/schools`)
      expect(await response!.text()).not.toContain('app-locale-menu')
      await waitForHydration(page)
      await expect(page.locator('.app-locale-menu')).toHaveCount(0)
      await expect(page.getByRole('button', { name: /^(语言|Language) / })).toHaveCount(0)
      await expect(page.locator('.app-header__brand')).toBeVisible()
      if (width < 1200) {
        await page.getByRole('button', { name: prefix ? 'Menu' : '菜单', exact: true }).click()
        await expect(page.locator('.app-header__panel')).toBeVisible()
        await expect(page.getByRole('menuitem', { name: /^(简体中文|English)$/ })).toHaveCount(0)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    })
  }
}

for (const width of [320, 390, 768, 1024]) {
  test(`${width}px 导航面板高亮当前页，关闭和跳转正常`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/en/resources?category=1')
    await waitForHydration(page)
    const toggle = page.getByRole('button', { name: 'Menu', exact: true })
    const panel = page.locator('.app-header__panel')
    await toggle.click()
    await expect(panel).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(
      panel.getByRole('link', { name: 'Teaching Resources', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    await expect(panel.locator('.app-header__panel-creation')).toHaveAttribute(
      'href',
      '/en/creation',
    )
    const bounds = await panel.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

    await panel.getByRole('link', { name: 'Teaching Resources', exact: true }).focus()
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect(toggle).toBeFocused()
    await toggle.click()
    await panel.getByRole('link', { name: 'School Stories', exact: true }).click()
    await expect(page).toHaveURL(/\/en\/schools$/)
    await expect(panel).toHaveCount(0)
  })
}

test('导航面板登录入口关闭菜单并打开登录弹窗，点击外部可关闭菜单', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  const toggle = page.getByRole('button', { name: '菜单', exact: true })
  const panel = page.locator('.app-header__panel')
  await toggle.click()
  await panel.getByRole('button', { name: '登录', exact: true }).click()
  await expect(panel).toHaveCount(0)
  await expect(page.getByRole('dialog').locator('#login-phone')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await toggle.click()
  await page.locator('.app-header__brand').click()
  await expect(panel).toHaveCount(0)
  await toggle.click()
  await page.mouse.click(4, 100)
  await expect(panel).toHaveCount(0)
})

test('已登录导航面板展示资料并可打开退出确认', async ({ page, context, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await setSession(context, testSession(), baseURL!)
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  await page.getByRole('button', { name: '菜单', exact: true }).click()
  const panel = page.locator('.app-header__panel')
  await expect(panel.locator('.app-header__panel-profile')).toContainText('测试用户1')
  await panel.getByRole('button', { name: '退出登录', exact: true }).click()
  await expect(panel).toHaveCount(0)
  await expect(page.getByRole('dialog')).toContainText('确定退出登录吗')
})
