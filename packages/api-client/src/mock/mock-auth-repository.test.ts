import { describe, expect, it } from 'vitest'

import { MockAuthRepository } from './mock-auth-repository'

describe('MockAuthRepository', () => {
  it('使用演示账号登录成功（手机号允许包含空格）', async () => {
    const repo = new MockAuthRepository()
    const session = await repo.login({ phone: '188 8888 8888', password: '123456' })
    expect(session.user.roles).toContain('admin')
    expect(session.token).toMatch(/^mock-token-/)
  })

  it('无空格手机号同样有效', async () => {
    const repo = new MockAuthRepository()
    const session = await repo.login({ phone: '18888888888', password: '123456' })
    expect(session.user.phone).toBe('18888888888')
  })

  it('密码错误抛出 UNAUTHORIZED', async () => {
    const repo = new MockAuthRepository()
    await expect(repo.login({ phone: '18888888888', password: '000000' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('me 返回演示用户', async () => {
    const repo = new MockAuthRepository()
    const user = await repo.me()
    expect(user?.id).toBe('u-001')
  })
})
