import { expect, test, setSession, testSession } from './academy.fixture'

test('未接入灵跃能力明确禁用，不打开失败授权流程', async ({ page }) => {
  await page.goto('/')
  const tools = page.locator('.learning-entries__tools').getByRole('button')
  await expect(tools).toHaveCount(4)
  for (const button of await tools.all()) await expect(button).toBeDisabled()
  await expect(page.locator('.learning-entries')).toContainText('该功能暂未接入')
})
for (const path of ['/account/teacher', '/lingyue/simulation']) {
  test(`未接入能力 ${path} 使用统一不可用页`, async ({ page, context, baseURL }) => {
    await setSession(context, testSession(), baseURL!)
    await page.goto(path)
    await expect(page.getByText('该功能暂未接入，当前不可用。')).toBeVisible()
    await expect(page.locator('main input')).toHaveCount(0)
  })
}
