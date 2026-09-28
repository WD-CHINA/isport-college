import { describe, expect, it } from 'vitest'
import { hasPermission } from './access-control'

describe('hasPermission', () => {
  it('按角色聚合权限', () => {
    expect(hasPermission(['user'], 'creation:use')).toBe(true)
    expect(hasPermission(['user', 'reviewer'], 'work:review')).toBe(true)
    expect(hasPermission(['user', 'operator'], 'course:manage')).toBe(true)
    expect(hasPermission(['user', 'reviewer'], 'course:manage')).toBe(false)
  })

  it('admin 拥有全部权限', () => {
    expect(hasPermission(['admin'], 'work:review')).toBe(true)
    expect(hasPermission(['admin'], 'content:manage')).toBe(true)
    expect(hasPermission(['admin'], 'creation:use')).toBe(true)
  })

  it('未登录用户不拥有权限', () => {
    expect(hasPermission(undefined, 'account:view')).toBe(false)
    expect(hasPermission([], 'admin:view')).toBe(false)
  })
})
