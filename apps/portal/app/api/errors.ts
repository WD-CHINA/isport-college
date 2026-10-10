const ERROR_STATUS = {
  VALIDATION_FAILED: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVICE_UNAVAILABLE: 503,
} as const

/** 错误码放入 data，以便 Nuxt/h3 转换与 SSR 序列化后仍可读取。 */
export type ApiErrorCode = keyof typeof ERROR_STATUS

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode: number
  readonly data: { code: ApiErrorCode }

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = ERROR_STATUS[code]
    this.data = { code }
  }

  static validation(message: string): ApiError {
    return new ApiError('VALIDATION_FAILED', message)
  }

  static notFound(message: string): ApiError {
    return new ApiError('NOT_FOUND', message)
  }

  static unauthorized(message: string): ApiError {
    return new ApiError('UNAUTHORIZED', message)
  }

  static forbidden(message: string): ApiError {
    return new ApiError('FORBIDDEN', message)
  }

  static serviceUnavailable(message: string): ApiError {
    return new ApiError('SERVICE_UNAVAILABLE', message)
  }
}

export function apiErrorCode(error: unknown): ApiErrorCode | undefined {
  if (!error || typeof error !== 'object') return undefined
  const code = (error as { data?: { code?: unknown } }).data?.code
  return typeof code === 'string' && Object.hasOwn(ERROR_STATUS, code)
    ? (code as ApiErrorCode)
    : undefined
}

export function isApiError(error: unknown): error is { message: string; statusCode?: number } {
  return !!apiErrorCode(error) && typeof (error as { message?: unknown }).message === 'string'
}
