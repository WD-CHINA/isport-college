import { randomUUID, timingSafeEqual } from 'node:crypto'
import { ApiError } from '@isport/api-client'
import { validateNamespace } from '@isport/api-client/mock'
import { AUTH_COOKIE_NAME, type ProductPhase } from '@isport/shared'

export function academyRequest(event: Parameters<typeof getCookie>[0]) {
  const config = useRuntimeConfig(event)
  if (config.dataSource !== 'mock')
    throw createError({ statusCode: 503, message: '真实接口尚未接入' })
  if (config.public.siteEnv === 'production')
    throw createError({ statusCode: 503, message: '生产环境禁止 Mock' })
  const namespace = config.mock.controlsEnabled
    ? validateNamespace(getCookie(event, 'academy_mock_namespace') || 'default')
    : 'default'
  let token = getHeader(event, 'authorization')
  if (!token) {
    try {
      token = (JSON.parse(getCookie(event, AUTH_COOKIE_NAME) || '{}') as { token?: string }).token
    } catch {
      token = undefined
    }
  }
  const origin = getHeader(event, 'origin')
  if (origin && origin !== getRequestURL(event).origin)
    throw createError({ statusCode: 403, message: '不允许跨站请求' })
  setHeader(event, 'Cache-Control', 'private, no-store')
  return {
    config,
    namespace,
    options: {
      token,
      phase: config.productPhase as ProductPhase,
      now: new Date().toISOString(),
      randomId: randomUUID,
    },
  }
}

export function requireMockControl(event: Parameters<typeof getCookie>[0]) {
  const request = academyRequest(event)
  const expected = request.config.mock.controlKey
  const received = getHeader(event, 'x-mock-control-key') ?? ''
  if (
    !request.config.mock.controlsEnabled ||
    !expected ||
    Buffer.byteLength(received) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  )
    throw createError({ statusCode: 404 })
  return request
}

export function throwAcademyError(error: unknown): never {
  if (error instanceof ApiError) {
    const status = {
      VALIDATION_FAILED: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      SERVICE_UNAVAILABLE: 503,
      UNKNOWN: 500,
    }[error.code]
    throw createError({ statusCode: status, message: error.message, data: { code: error.code } })
  }
  throw error
}
