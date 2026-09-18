import { DEMO_ACCOUNT, demoUser } from '@isport/mock-data'
import type { AuthSession, User } from '@isport/shared'
import { normalizePhone } from '@isport/shared'

import { ApiError } from '../errors'
import type { AuthRepository, LoginPayload } from '../repositories/auth'
import { delay, resolveLatency } from './delay'
import type { MockOptions } from './options'

/**
 * Mock 登录 Repository：固定演示凭证校验。
 * 注意：凭证会出现在浏览器构建产物中，不具备任何安全性，仅用于前端原型。
 */
export class MockAuthRepository implements AuthRepository {
  private readonly latency?: number | [number, number]

  constructor(options: MockOptions = {}) {
    this.latency = options.latency
  }

  async login(payload: LoginPayload): Promise<AuthSession> {
    await delay(resolveLatency(this.latency))

    const phone = normalizePhone(payload.phone)
    if (phone !== DEMO_ACCOUNT.phone || payload.password !== DEMO_ACCOUNT.password) {
      throw ApiError.unauthorized('Invalid phone number or password')
    }

    return {
      user: { ...demoUser, roles: [...demoUser.roles] },
      token: `mock-token-${Date.now().toString(36)}`,
      issuedAt: new Date().toISOString(),
    }
  }

  async logout(): Promise<void> {
    await delay(resolveLatency(this.latency))
  }

  async me(): Promise<User | null> {
    await delay(resolveLatency(this.latency))
    return { ...demoUser, roles: [...demoUser.roles] }
  }
}

export function createMockAuthRepository(options: MockOptions = {}): AuthRepository {
  return new MockAuthRepository(options)
}
