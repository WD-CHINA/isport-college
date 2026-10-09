import type { WebProfile } from '@isport/shared'

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

/** 登录和资料接口的原始响应，整理成会话里使用的资料。 */
export function toWebProfile(value: unknown): WebProfile | null {
  const row = record(value)
  if (typeof row.id !== 'number' || !Number.isInteger(row.id) || row.id < 1) return null
  const avatarCode = typeof row.avatarCode === 'number' ? row.avatarCode : 1
  return {
    id: row.id,
    phoneMask: typeof row.phoneMask === 'string' ? row.phoneMask : '',
    nickname: typeof row.nickname === 'string' ? row.nickname : '',
    avatarCode: avatarCode >= 1 ? avatarCode : 1,
    nicknamePromptNeeded: row.nicknamePromptNeeded === true,
  }
}
