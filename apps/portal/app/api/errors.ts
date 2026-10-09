/** 错误码放入 data，以便 Nuxt/h3 转换与 SSR 序列化后仍可读取。 */
export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode: number
  readonly data: { code: ApiErrorCode; details?: unknown }
  readonly details?: unknown

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.statusCode = {
      VALIDATION_FAILED: 400,
      NOT_FOUND: 404,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      SERVICE_UNAVAILABLE: 503,
      UNKNOWN: 500,
    }[code]
    this.data = { code, ...(details === undefined ? {} : { details }) }
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError('VALIDATION_FAILED', message, details)
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError('NOT_FOUND', message)
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError('UNAUTHORIZED', message)
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError('FORBIDDEN', message)
  }

  static serviceUnavailable(message = 'Service unavailable'): ApiError {
    return new ApiError('SERVICE_UNAVAILABLE', message)
  }
}

export function apiErrorCode(error: unknown): ApiErrorCode | undefined {
  if (error instanceof ApiError) return error.code
  if (!error || typeof error !== 'object') return undefined
  const data = (error as { data?: { code?: unknown } }).data
  const codes: ApiErrorCode[] = [
    'VALIDATION_FAILED',
    'NOT_FOUND',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'SERVICE_UNAVAILABLE',
    'UNKNOWN',
  ]
  return codes.find(code => code === data?.code)
}

export function isApiError(error: unknown): error is { message: string; statusCode?: number } {
  return !!apiErrorCode(error) && typeof (error as { message?: unknown }).message === 'string'
}
