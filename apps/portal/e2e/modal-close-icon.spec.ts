import { expect, test, waitForHydration } from './academy.fixture'

for (const prefix of ['', '/en']) {
  test(`${prefix || '中文'} 登录弹窗反复销毁重开后保留关闭图标`, async ({ page }) => {
    await page.goto(`${prefix}/resources`)
    await waitForHydration(page)
    const login = page.locator('.app-header__actions').getByRole('button', {
      name: prefix ? 'Sign in' : /登\s*录/,
      exact: true,
    })
    const dialog = page.getByRole('dialog')
    for (let cycle = 0; cycle < 3; cycle++) {
      await test.step(`第 ${cycle + 1} 次打开和关闭`, async () => {
        await login.click()
        await expect(dialog).toBeVisible()
        const close = dialog.locator('.ant-modal-close')
        await expect(close).toHaveAccessibleName(prefix ? 'Close' : '关闭')
        await expect(close.locator('svg')).toBeVisible()
        await close.click()
        await expect(dialog).toHaveCount(0)
      })
    }
  })
}
