import { ApiError } from './errors'

export interface RequestOptions {
  baseURL: string
  getToken?: () => string | undefined
  getLocale?: () => 'zh-CN' | 'en-US'
  fetch?: typeof fetch
  onUnauthorized?: () => void
}

export type ApiRequest = (
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  body?: unknown,
  query?: Record<string, string | number | undefined>,
  signal?: AbortSignal,
) => Promise<unknown>

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

/**
 * 统一请求：地址、鉴权头、语言头，以及学苑信封 `{status,message,data}`。
 * 接口模块只传 method/path/body/query，不各自挂拦截器。
 */
export function createRequest(options: RequestOptions): ApiRequest {
  return async function request(method, path, body, query, signal) {
    let url: URL
    try {
      url = new URL(`/api/v1${path}`, options.baseURL)
    } catch {
      throw ApiError.serviceUnavailable('学苑接口地址不正确')
    }
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === '') continue
      url.searchParams.set(key, String(value))
    }

    const headers = new Headers({
      Accept: 'application/json',
      'X-Locale': options.getLocale?.() ?? 'zh-CN',
    })
    if (body !== undefined) headers.set('Content-Type', 'application/json')
    const token = options.getToken?.()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    let response: Response
    try {
      response = await (options.fetch ?? fetch)(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error
      throw ApiError.serviceUnavailable('学苑接口暂时不可用')
    }

    let payload: Record<string, unknown> = {}
    try {
      payload = asRecord(await response.json())
    } catch {
      payload = {}
    }

    const status = typeof payload.status === 'number' ? payload.status : response.status
    const message =
      typeof payload.message === 'string' && payload.message ? payload.message : '参数不正确'

    if (response.status === 401 || status === 401) {
      options.onUnauthorized?.()
      throw ApiError.unauthorized(message)
    }
    if (response.status !== 200 || status !== 200) {
      if (/不存在|已下架|not found|unavailable/i.test(message)) throw ApiError.notFound(message)
      if (response.status >= 500 || status >= 500) throw ApiError.serviceUnavailable(message)
      throw ApiError.validation(message)
    }
    return payload.data ?? null
  }
}
