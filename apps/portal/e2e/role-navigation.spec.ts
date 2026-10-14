import { expect, test, setSession, testSession } from './academy.fixture'

test('普通前台用户只显示个人中心，不显示管理与创作入口', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/resources')
  const account = page.locator('.app-header__user')
  await expect(account).toContainText('测试用户1')
  await expect(account).toHaveAttribute('href', '/account')
  await expect(
    page.locator('.app-header__nav').getByRole('link', { name: /我的账号|管理后台|创作中心/ }),
  ).toHaveCount(0)
})
test('并发 SSR 会话各自渲染资料，令牌不进入 HTML payload', async ({ browser, baseURL }) => {
  const contexts = await Promise.all([browser.newContext(), browser.newContext()])
  try {
    const sessions = [testSession(1), testSession(2)]
    await Promise.all(
      contexts.map((context, index) => setSession(context, sessions[index]!, baseURL!)),
    )
    const responses = await Promise.all(
      contexts.map(context => context.request.get(`${baseURL}/account`)),
    )
    const html = await Promise.all(responses.map(response => response.text()))
    expect(html[0]).toContain('测试用户1')
    expect(html[0]).not.toContain('测试用户2')
    expect(html[1]).toContain('测试用户2')
    expect(html[1]).not.toContain('测试用户1')
    for (let index = 0; index < 2; index++)
      expect(html[index]).not.toContain(sessions[index]!.token)
  } finally {
    await Promise.all(contexts.map(context => context.close()))
  }
})
