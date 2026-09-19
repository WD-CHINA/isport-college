import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function loginAdmin(page: Page, path = '/admin') {
  await page.goto(path)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('#login-phone').fill('188 8888 8888')
  await dialog.locator('#login-password').fill('123456')
  await dialog.getByRole('button', { name: /登\s*录|Sign In/ }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('.admin-header__user')).toBeVisible()
}

/** 演示账号登录：全局唯一登录弹窗 → 登录成功 → 恢复目标操作 */
test('未登录访问 /admin 弹出登录框，登录后进入工作台', async ({ page }) => {
  await loginAdmin(page)

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByText('课程总数')).toBeVisible()

  // Cookie 会话刷新后仍能在初始导航阶段被门禁读取。
  await page.reload()
  await expect(page.getByText('课程总数')).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('管理端用户菜单支持返回首页和退出登录', async ({ page }) => {
  await loginAdmin(page)
  await page.locator('.admin-header__user').click()
  await page.getByRole('menuitem', { name: '返回首页' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('menuitem', { name: '返回首页' })).toBeHidden()

  await page.goto('/admin')
  await page.locator('.admin-header__user').click()
  await page.getByRole('menuitem', { name: '退出登录' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('menuitem', { name: '退出登录' })).toBeHidden()

  await page.goto('/admin')
  await expect(page.getByRole('dialog', { name: '登录 iSport' })).toBeVisible()
})

test('课程表单支持编辑富文本简介', async ({ page }) => {
  await loginAdmin(page, '/admin/courses')
  await page.getByRole('button', { name: '新建课程', exact: true }).click()

  const dialog = page.getByRole('dialog', { name: '新建课程' })
  const editor = dialog.locator('.rich-text-editor__content').first()
  await expect(dialog.locator('.rich-text-editor')).toHaveCount(2)

  await editor.fill('课程亮点')
  await editor.selectText()
  await dialog.getByRole('button', { name: '加粗' }).first().click()

  await expect(editor.locator('strong')).toHaveText('课程亮点')
})

for (const initialLocale of ['zh', 'en'] as const) {
  test(`管理端日期组件在 ${initialLocale} 首次加载及语言切换后保持一致`, async ({ page }) => {
    await loginAdmin(page, initialLocale === 'zh' ? '/admin/courses' : '/en/admin/courses')

    for (const locale of [initialLocale, initialLocale === 'zh' ? 'en' : 'zh', initialLocale]) {
      await page.getByRole('combobox', { name: /^(语言|Language)$/ }).selectOption(locale)
      await expect(page).toHaveURL(locale === 'zh' ? /\/admin\/courses$/ : /\/en\/admin\/courses$/)
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        locale === 'zh' ? 'zh-CN' : 'en-US',
      )

      const title = locale === 'zh' ? '新建课程' : 'New Course'
      await page.getByRole('button', { name: title, exact: true }).click()
      const dialog = page.getByRole('dialog', { name: title })
      await expect(
        dialog.getByRole('button', { name: locale === 'zh' ? /确\s*定/ : 'OK' }),
      ).toBeVisible()
      await dialog.getByPlaceholder(locale === 'zh' ? '请选择日期' : 'Select date').click()
      await expect(page.locator('.ant-picker-content thead th')).toHaveText(
        locale === 'zh'
          ? ['一', '二', '三', '四', '五', '六', '日']
          : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      )
      await dialog.getByRole('button', { name: locale === 'zh' ? /取\s*消/ : 'Cancel' }).click()
      await expect(dialog).toBeHidden()
    }
  })
}
