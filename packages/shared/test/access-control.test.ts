import { describe, expect, it } from 'vitest'
import { hasWebPermission, PERMISSIONS } from '../src/access-control'

describe('当前学苑协议权限', () => {
  it('有效前台会话只开放个人中心', () => {
    for (const permission of PERMISSIONS)
      expect(hasWebPermission({ id: 1 }, permission)).toBe(permission === 'account:view')
  })
  it('缺失或畸形资料不能授予权限', () => {
    for (const profile of [undefined, null, { id: 0 }, { id: -1 }, { id: 1.5 }])
      expect(hasWebPermission(profile, 'account:view')).toBe(false)
  })
})
