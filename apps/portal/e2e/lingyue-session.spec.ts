import { expect, setSession, test, testSession, waitForHydration } from './academy.fixture'

test('退出后丢弃晚到的灵跃启动地址', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await context.route('https://lingyue.dream-sports.cn/**', route =>
    route.fulfill({ body: 'Lingyue service' }),
  )
  let release!: () => void
  const gate = new Promise<void>(resolve => {
    release = resolve
  })
  let started!: () => void
  const requested = new Promise<void>(resolve => {
    started = resolve
  })
  await page.route('**/api/v1/me/lingyue/launch', async route => {
    started()
    await gate
    await route.fulfill({
      json: {
        status: 200,
        message: 'OK',
        data: {
          launchUrl: 'https://lingyue.dream-sports.cn/launch?token=old-session',
          lingyueBound: true,
        },
      },
    })
  })
  const popups: string[] = []
  page.on('popup', popup => popups.push(popup.url()))
  await page.goto('/')
  await waitForHydration(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  await page.locator('.app-header__cta-lingyue').click()
  await page.getByRole('button', { name: '授权并继续' }).click()
  await requested
  const other = await context.newPage()
  await other.goto('/')
  await waitForHydration(other)
  await other.locator('.app-header__user').click()
  await other.getByRole('button', { name: '退出登录', exact: true }).click()
  await other
    .getByRole('dialog')
    .getByRole('button', { name: /确\s*定/ })
    .click()
  await expect(page.locator('.app-header__login')).toBeVisible()
  const response = page.waitForResponse('**/api/v1/me/lingyue/launch')
  release()
  await response
  // 等待渲染下一帧，确保 fetch 的后续回调已执行。
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
  expect(popups).toEqual([])
  await page.locator('.app-header__cta-lingyue').click()
  await expect(page.getByRole('dialog').locator('#login-phone')).toBeVisible()
  await other.close()
})
