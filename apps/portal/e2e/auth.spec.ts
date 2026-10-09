import { AUTH_COOKIE_NAME } from '@isport/shared'
import { expect, test } from './academy.fixture'

test.describe('认证与个人中心', () => {
  test.skip(true, '依赖已移除的同源 mock 登录与演示验证码，待按真实短信流程重写')

  test('占位', async ({ context, baseURL }) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: encodeURIComponent(JSON.stringify({ token: 'fake' })),
        url: baseURL!,
      },
    ])
    expect((await context.request.get('/')).status()).toBe(200)
  })
})
