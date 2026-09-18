/** 统一错误模型：未来 HTTP 实现将复用同一组错误码 */
export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly details?: unknown

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
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

  static serviceUnavailable(message = 'Service unavailable'): ApiError {
    return new ApiError('SERVICE_UNAVAILABLE', message)
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
