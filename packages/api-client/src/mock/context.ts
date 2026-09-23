import { MOCK_RULES, type MockSnapshot } from '@isport/mock-data'
import type { AcademyUser, PageResult, ProductPhase, Role } from '@isport/shared'
import { ApiError } from '../errors'

export interface MockContext {
  state: MockSnapshot
  now: string
  phase: ProductPhase
  token?: string
  randomId: () => string
}

/** 验证失败仍需持久化验证码次数，不提交其他业务失败的修改。 */
export class CommittedError extends ApiError {}

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw ApiError.validation('请求参数必须为对象')
  return value as Record<string, unknown>
}

export function text(
  input: Record<string, unknown>,
  key: string,
  max = 200,
  optional = false,
): string {
  const value = input[key]
  if (optional && (value === undefined || value === '')) return ''
  if (typeof value !== 'string' || (!optional && !value.trim()) || value.length > max) {
    throw ApiError.validation(`字段 ${key} 不合法`)
  }
  return value.trim()
}

export function numeric(input: Record<string, unknown>, key: string, fallback?: number): number {
  if (input[key] === undefined && fallback !== undefined) return fallback
  const value = input[key]
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw ApiError.validation(`字段 ${key} 不合法`)
  return value
}

export function flag(input: Record<string, unknown>, key: string): boolean {
  if (typeof input[key] !== 'boolean') throw ApiError.validation(`字段 ${key} 不合法`)
  return input[key]
}

export function choice<T extends string>(
  input: Record<string, unknown>,
  key: string,
  values: readonly T[],
): T {
  const value = text(input, key)
  if (!values.includes(value as T)) throw ApiError.validation(`字段 ${key} 不合法`)
  return value as T
}

export function nextId(ctx: MockContext, prefix: string): string {
  return `${prefix}-${++ctx.state.sequence}`
}

export function currentUser(ctx: MockContext, required = true): AcademyUser | undefined {
  const session = ctx.state.sessions.find(item => item.token === ctx.token)
  const age = session ? Date.parse(ctx.now) - Date.parse(session.issuedAt) : NaN
  const valid = session && age >= 0 && age < MOCK_RULES.sessionTtlSeconds * 1000
  const user = valid ? ctx.state.users.find(item => item.id === session.userId) : undefined
  if (!user && required) throw ApiError.unauthorized('请重新登录')
  return user
}

export function requireUser(ctx: MockContext, role?: Role): AcademyUser {
  const user = currentUser(ctx)!
  if (role && !user.roles.includes(role) && !user.roles.includes('admin'))
    throw new ApiError('FORBIDDEN', '没有操作权限')
  return user
}

export function requireP1(ctx: MockContext): void {
  if (ctx.phase !== 'p1') throw ApiError.notFound('此功能尚未开放')
}

export function page<T>(rows: T[], input: Record<string, unknown>): PageResult<T> {
  const pageNumber = Math.max(1, numeric(input, 'page', 1))
  const pageSize = Math.max(1, Math.min(100, numeric(input, 'pageSize', MOCK_RULES.pageSize)))
  return {
    list: rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    total: rows.length,
    page: pageNumber,
    pageSize,
  }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    )
  }
  return value
}

export function once<T>(
  ctx: MockContext,
  operation: string,
  input: Record<string, unknown>,
  run: () => T,
): T {
  const key = `${requireUser(ctx).id}:${operation}:${text(input, 'requestId', 128)}`
  const fingerprint = JSON.stringify(canonical(input))
  const previous = ctx.state.idempotency.find(item => item.key === key)
  if (previous) {
    if (previous.fingerprint !== fingerprint) throw ApiError.validation('幂等键已用于其他请求')
    return previous.result as T
  }
  const result = run()
  ctx.state.idempotency.push({
    key,
    fingerprint,
    result: JSON.parse(JSON.stringify(result)) as unknown,
  })
  return result
}
