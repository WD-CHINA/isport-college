import { expect, test, setSession, testSession } from './academy.fixture'

for (const path of ['/account/teacher', '/lingyue/simulation']) {
  test(`未接入能力 ${path} 使用统一不可用页`, async ({ page, context, baseURL }) => {
    await setSession(context, testSession(), baseURL!)
    await page.goto(path)
    await expect(page.getByText('该功能暂未接入，当前不可用。')).toBeVisible()
    await expect(page.locator('main input')).toHaveCount(0)
  })
}
