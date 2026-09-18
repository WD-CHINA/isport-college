import type { AuthSession, User } from '@isport/shared'

/** 登录载荷：phone 允许包含空格，实现侧负责归一化 */
export interface LoginPayload {
  phone: string
  password: string
}

export interface AuthRepository {
  login(payload: LoginPayload): Promise<AuthSession>
  logout(): Promise<void>
  me(): Promise<User | null>
}
