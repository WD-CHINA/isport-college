import { createFetch, type $Fetch, type CreateFetchOptions } from 'ofetch'

import { ApiError, type ApiErrorCode } from '../errors'

/** 已知错误码运行时清单（与 ApiErrorCode 联合类型保持同步） */
const knownErrorCodes: readonly string[] = [
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'SERVICE_UNAVAILABLE',
  'UNKNOWN',
]

/** 业务包体成功码（isport-library 后端约定：HTTP 200 且 body.code === 200 视为成功） */
const BUSINESS_SUCCESS_CODE = 200

/** HTTP 状态码 / 业务码 → 统一错误码兜底映射（服务端未给出合法 code 字段时使用） */
const statusCodeToErrorCode: Readonly<Record<number, ApiErrorCode>> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'VALIDATION_FAILED',
  422: 'VALIDATION_FAILED',
  500: 'SERVICE_UNAVAILABLE',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'SERVICE_UNAVAILABLE',
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

/** 错误消息提取：优先 msg，其次 message（兼容 isport-library 后端字段约定） */
function extractMessage(record: Record<string, unknown>): string | undefined {
  const value = record['msg'] ?? record['message']
  return typeof value === 'string' && value !== '' ? value : undefined
}

/** 将 HTTP 错误响应转换为统一 ApiError：code 优先取服务端合法值，其次按状态码兜底 */
function toApiError(status: number, body: unknown): ApiError {
  const record = asRecord(body)

  const serverCode = record['code']
  const code =
    typeof serverCode === 'string' && knownErrorCodes.includes(serverCode)
      ? (serverCode as ApiErrorCode)
      : (statusCodeToErrorCode[status] ?? 'UNKNOWN')

  return new ApiError(
    code,
    extractMessage(record) ?? `Request failed with status ${status}`,
    record['details'],
  )
}

/**
 * 解包业务响应体（isport-library 后端约定：`{ code, msg, data }`）。
 * - code === 200：返回 `data ?? result ?? body`；
 * - code === 401：登录失效，先触发 onUnauthorized 再抛错；
 * - 其他 code：转换为 ApiError 抛出（message 取 msg/message）；
 * - 无数字 code 的响应体（文件流、直接数据）：原样返回。
 */
function unwrapEnvelope(body: unknown, onUnauthorized?: () => void): unknown {
  const record = asRecord(body)
  const businessCode = record['code']
  if (typeof businessCode !== 'number') return body

  if (businessCode === BUSINESS_SUCCESS_CODE) {
    return record['data'] ?? record['result'] ?? body
  }

  const apiError = new ApiError(
    statusCodeToErrorCode[businessCode] ?? 'UNKNOWN',
    extractMessage(record) ?? `Request failed with business code ${businessCode}`,
    record['details'],
  )
  if (apiError.code === 'UNAUTHORIZED') {
    onUnauthorized?.()
  }
  throw apiError
}

export interface HttpClientOptions {
  /** API 基础地址（Nuxt 端传 runtimeConfig.public.apiBase）；为空时使用相对路径 */
  baseURL?: string
  /**
   * 每次请求前调用，返回附加请求头（如 Authorization）。
   * isport-library 后端约定：token 直接作为 Authorization 值，无 Bearer 前缀。
   * 凭据存于 localStorage，仅客户端可用；SSR 期间应返回 undefined（匿名请求）。
   */
  getHeaders?: () => Record<string, string> | undefined
  /** 收到 401 时的回调（如清理凭据、唤起登录）；错误仍会以 ApiError 抛出 */
  onUnauthorized?: () => void
  /** 请求超时毫秒数，默认 10000 */
  timeout?: number
  /** 自定义 fetch 实现（单元测试或特殊运行时注入），默认全局 fetch */
  fetch?: CreateFetchOptions['fetch']
}

/**
 * 基于 ofetch（Nuxt `$fetch` 的内核）创建 HTTP 客户端，供 `apps/portal/app/api` 接口封装使用。
 *
 * - 兼容 isport-library 后端业务包体（`{ code, msg, data }`）：成功自动解包 `data ?? result`，业务错误码（如 401/500）转换为 ApiError；
 * - 成功响应直接返回解析后的数据（默认 JSON）；
 * - HTTP 错误与网络错误统一转换为 ApiError；
 * - 错误在响应钩子中即时抛出，不触发 ofetch 内建重试，重试策略由业务层决定；
 * - 用户主动取消（AbortSignal）保留原始 AbortError，便于业务层识别取消语义。
 */
export function createHttpClient(options: HttpClientOptions = {}): $Fetch {
  return createFetch({
    defaults: {
      baseURL: options.baseURL,
      timeout: options.timeout ?? 30_000,
      onRequest({ options: requestOptions }) {
        const headers = options.getHeaders?.()
        if (!headers) return
        const merged = new Headers(requestOptions.headers)
        for (const [key, value] of Object.entries(headers)) {
          merged.set(key, value)
        }
        requestOptions.headers = merged
      },
      onResponse({ response }) {
        response._data = unwrapEnvelope(response._data, options.onUnauthorized)
      },
      onResponseError({ response }) {
        const apiError = toApiError(response.status, response._data)
        if (apiError.code === 'UNAUTHORIZED') {
          options.onUnauthorized?.()
        }
        throw apiError
      },
      onRequestError({ error }) {
        if (error instanceof ApiError) throw error
        // 用户主动取消：保留原始错误，业务层可据此忽略取消引发的失败
        if (error.name === 'AbortError') throw error
        const message = error.name === 'TimeoutError' ? 'Request timed out' : error.message
        throw ApiError.serviceUnavailable(message)
      },
    },
    fetch: options.fetch,
  })
}
