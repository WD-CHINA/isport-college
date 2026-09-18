import type { AuthSession } from '@isport/shared'
import { AUTH_SESSION_TTL, AUTH_STORAGE_KEY } from '@isport/shared'

interface StoredAuthSession {
  session: AuthSession
  /** 过期时间戳（毫秒） */
  expiresAt: number
}

/** 读取登录会话（过期或损坏自动清除）；SSR 环境恒返回 null */
export function readAuthSession(): AuthSession | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as StoredAuthSession
    if (typeof stored.expiresAt !== 'number' || stored.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return stored.session
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

/** 写入登录会话，有效期 AUTH_SESSION_TTL 秒 */
export function writeAuthSession(session: AuthSession): void {
  if (!import.meta.client) return
  const stored: StoredAuthSession = {
    session,
    expiresAt: Date.now() + AUTH_SESSION_TTL * 1000,
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored))
}

/** 清除登录会话 */
export function clearAuthSession(): void {
  if (!import.meta.client) return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
