import { ApiError } from './errors'

export interface RequestOptions {
  baseURL: string
  getToken?: () => string | undefined
  getLocale?: () => 'zh-CN' | 'en-US'
  fetch?: typeof fetch
  onUnauthorized?: (token: string | undefined) => void
  timeoutMs?: number
}

export interface ApiRequestOptions {
  body?: unknown
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

export type ApiRequest = (
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  options?: ApiRequestOptions,
) => Promise<unknown>

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** HTTP 状态优先；HTTP 200 再检查学苑信封中的业务状态。 */
async function readResponse(response: Response): Promise<unknown> {
  const payload = asRecord(await response.json().catch(() => null))
  const status = response.status === 200 ? payload.status : response.status
  if (typeof status !== 'number') {
    throw ApiError.serviceUnavailable('学苑接口响应格式不正确')
  }
  const message =
    typeof payload.message === 'string' && payload.message ? payload.message : '学苑接口请求失败'

  if (status === 401) throw ApiError.unauthorized(message)
  if (status === 403) throw ApiError.forbidden(message)
  if (status === 404) throw ApiError.notFound(message)
  if (status >= 500) throw ApiError.serviceUnavailable(message)
  if (status === 400 || response.status !== 200) {
    throw ApiError.validation(message)
  }
  if (status !== 200 || !Object.hasOwn(payload, 'data') || typeof payload.message !== 'string') {
    throw ApiError.serviceUnavailable('学苑接口响应格式不正确')
  }
  return payload.data
}

/** 地址、鉴权与语言头、信封、超时和取消；不处理业务字段。 */
export function createRequest(options: RequestOptions): ApiRequest {
  const send = options.fetch ?? fetch
  return async function request(method, path, { body, query, signal } = {}) {
    signal?.throwIfAborted()
    // 绝对路径会盖掉 base 里的目录，先保留 /academy 这类前缀再拼接 /api/v1。
    const url = new URL(options.baseURL)
    const prefix = url.pathname.replace(/\/$/, '')
    url.pathname = `${prefix}/api/v1${path}`
    url.search = ''
    url.hash = ''
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
    const token = options.getToken?.()
    const headers: Record<string, string> = {
      accept: 'application/json',
      'x-locale': options.getLocale?.() ?? 'zh-CN',
    }
    if (body !== undefined) headers['content-type'] = 'application/json'
    if (token) headers.authorization = `Bearer ${token}`

    const controller = new AbortController()
    const requestSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal
    const timer = setTimeout(
      () => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
      options.timeoutMs ?? 8_000,
    )
    let rejectAbort!: () => void
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = () => reject(requestSignal.reason)
      if (requestSignal.aborted) rejectAbort()
      else requestSignal.addEventListener('abort', rejectAbort, { once: true })
    })
    try {
      const response = send(url, {
        method,
        credentials: 'omit',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: requestSignal,
      }).then(readResponse)
      return await Promise.race([response, aborted])
    } catch (error) {
      if (signal?.aborted) throw signal.reason
      if (error instanceof ApiError) {
        if (error.code === 'UNAUTHORIZED') options.onUnauthorized?.(token)
        throw error
      }
      if (error instanceof Error && error.name === 'AbortError') throw error
      throw ApiError.serviceUnavailable(
        controller.signal.aborted ? '学苑接口请求超时' : '学苑接口暂时不可用',
      )
    } finally {
      clearTimeout(timer)
      requestSignal.removeEventListener('abort', rejectAbort)
    }
  }
}
