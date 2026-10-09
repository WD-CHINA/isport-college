import { expect, test } from './academy.fixture'

test.describe('创作与灵跃', () => {
  test.skip(true, '依赖已移除的同源 mock 操作接口，待按真实能力重写')

  test('占位', async ({ context }) => {
    expect((await context.request.get('/admin/creation')).status()).toBeGreaterThanOrEqual(200)
  })
})
