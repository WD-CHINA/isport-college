import { expect, test, setSession, testSession, waitForHydration } from './academy.fixture'

for (const [prefix, avatarLabel, optionLabel, confirmLabel, cancelLabel] of [
  ['', '选择头像', '头像 2', '确认使用', /取\s*消/],
  ['/en', 'Choose an avatar', 'Avatar 2', 'Use avatar', 'Cancel'],
] as const) {
  test(`${prefix || '中文'} 页头可进入账号，手机头像选择与退出入口完整可用`, async ({
    page,
    context,
    baseURL,
  }) => {
    await setSession(context, testSession(), baseURL!)
    await page.goto(`${prefix}/resources`)
    await waitForHydration(page)
    await page.locator('.app-header__user').click()
    await page.locator(`a[href="${prefix}/account"]`).click()
    await expect(page).toHaveURL(`${prefix}/account`)
    await expect(page.locator('.app-footer__inner')).toHaveCount(0)
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page
        .locator('.account-profile')
        .getByRole('button', { name: avatarLabel, exact: true })
        .click()
      const dialog = page.getByRole('dialog', { name: avatarLabel, exact: true })
      await expect(dialog.locator('.avatar-picker button')).toHaveCount(8)
      await dialog.getByRole('button', { name: optionLabel, exact: true }).click()
      await expect(dialog.getByRole('button', { name: confirmLabel, exact: true })).toBeEnabled()
      if (width === 1440) {
        await expect(dialog.locator('.account-avatar-modal')).toHaveCSS('min-height', '480px')
        await expect(dialog.locator('.account-avatar-modal')).toHaveCSS('padding-left', '32px')
      }
      const box = (await dialog.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(width)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await dialog.getByRole('button', { name: cancelLabel, exact: true }).click()
      await expect(dialog).toBeHidden()
    }
    await page.setViewportSize({ width: 390, height: 900 })
    await page.locator('.app-header__burger').click()
    await expect(page.locator('.app-header__panel-profile')).toHaveAttribute(
      'href',
      `${prefix}/account`,
    )
    await expect(page.locator('.app-header__panel-profile img')).toHaveAttribute(
      'src',
      '/auth/avatars/1.png',
    )
  })
}

test('头像加载失败可重试，保存失败保留旧头像和选择草稿', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  let failList = true
  let failSave = true
  await page.route('**/api/v1/avatars', route =>
    failList
      ? route.fulfill({
          status: 503,
          json: { status: 503, message: '头像列表暂不可用', data: null },
        })
      : route.continue(),
  )
  await page.route('**/api/v1/me/avatar', route =>
    failSave
      ? route.fulfill({ status: 503, json: { status: 503, message: '头像保存失败', data: null } })
      : route.continue(),
  )
  await page.goto('/account')
  await waitForHydration(page)
  await page.getByRole('button', { name: '选择头像', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '选择头像', exact: true })
  await expect(dialog.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible()
  await expect(dialog.getByRole('button', { name: '确认使用', exact: true })).toBeDisabled()
  failList = false
  await dialog.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await dialog.getByRole('button', { name: '头像 2', exact: true }).click()
  await dialog.getByRole('button', { name: '确认使用', exact: true }).click()
  await expect(page.locator('.ant-message-notice-error')).toContainText('头像保存失败')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: '头像 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.locator('.app-header__user img')).toHaveAttribute('src', '/auth/avatars/1.png')
  failSave = false
  await dialog.getByRole('button', { name: '确认使用', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('.app-header__user img')).toHaveAttribute('src', '/auth/avatars/2.png')
})

test('离开账号页后，晚到的头像保存响应不覆盖当前资料', async ({ page, context, baseURL }) => {
  const session = testSession()
  await setSession(context, session, baseURL!)
  let release!: () => void
  const blocked = new Promise<void>(resolve => {
    release = resolve
  })
  await page.route('**/api/v1/me/avatar', async route => {
    const response = await route.fetch()
    await blocked
    await route.fulfill({ response })
  })
  await page.goto('/account')
  await waitForHydration(page)
  await page.getByRole('button', { name: '选择头像', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '选择头像', exact: true })
  await dialog.getByRole('button', { name: '头像 3', exact: true }).click()
  const saving = page.waitForRequest('**/api/v1/me/avatar')
  await dialog.getByRole('button', { name: '确认使用', exact: true }).click()
  await saving
  await page.evaluate(() => {
    const app = document.querySelector('#__nuxt') as Element & {
      __vue_app__: { $nuxt: { $router: { push: (path: string) => Promise<unknown> } } }
    }
    return app.__vue_app__.$nuxt.$router.push('/resources')
  })
  const saved = page.waitForResponse('**/api/v1/me/avatar')
  release()
  await saved
  await expect(page.locator('.app-header__user img')).toHaveAttribute('src', '/auth/avatars/1.png')
})
