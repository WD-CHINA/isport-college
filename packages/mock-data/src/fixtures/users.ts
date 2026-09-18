import type { User } from '@isport/shared'

/**
 * 演示账号（仅用于前端原型，公开测试数据，不得沿用至生产环境）。
 * 校验前先移除手机号中的空格。
 */
export const DEMO_ACCOUNT = {
  /** 归一化后的演示手机号 */
  phone: '18888888888',
  password: '123456',
} as const

/** Mock 用户：默认同时拥有 C 端用户与管理员演示角色 */
export const demoUser: User = {
  id: 'u-001',
  phone: DEMO_ACCOUNT.phone,
  name: '演示用户',
  roles: ['user', 'admin'],
}
