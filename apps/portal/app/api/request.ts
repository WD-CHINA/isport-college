import { ApiError } from './errors'

export interface RequestOptions {
  baseURL: string
  getToken?: () => string | undefined
  getLocale?: () => 'zh-CN' | 'en-US'
  fetch?: typeof fetch
  onUnauthorized?: (token: string | undefined) => void
  timeoutMs?: number
}

export type ApiRequest = (
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  body?: unknown,
  query?: Record<string, string | number | undefined>,
  signal?: AbortSignal,
) => Promise<unknown>

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** 地址、鉴权与语言头、信封、超时和取消；不处理业务字段。 */
export function createRequest(options: RequestOptions): ApiRequest {
  return async function request(method, path, body, query, signal) {
    let url: URL
    try {
      url = new URL(`/api/v1${path}`, options.baseURL)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol')
    } catch {
      throw ApiError.serviceUnavailable('学苑接口地址不正确')
    }
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
    const token = options.getToken?.()
    const headers = new Headers({
      Accept: 'application/json',
      'X-Locale': options.getLocale?.() ?? 'zh-CN',
    })
    if (body !== undefined) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const controller = new AbortController()
    const cancel = () => controller.abort(signal?.reason)
    if (signal?.aborted) cancel()
    else signal?.addEventListener('abort', cancel, { once: true })
    const timer = setTimeout(
      () => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
      options.timeoutMs ?? 8_000,
    )
    let rejectAbort: () => void = () => {}
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = () => reject(controller.signal.reason)
      if (controller.signal.aborted) rejectAbort()
      else controller.signal.addEventListener('abort', rejectAbort, { once: true })
    })
    async function execute() {
      if (controller.signal.aborted) throw controller.signal.reason
      const response = await (options.fetch ?? fetch)(url, {
        method,
        credentials: 'omit',
        // h3 event.fetch 通过对象展开合并头部；Headers 实例会丢失 Bearer 与语言。
        headers: Object.fromEntries(headers),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })
      let payload: Record<string, unknown> = {}
      try {
        payload = asRecord(await response.json())
      } catch {
        // HTTP 失败仍按状态分类；成功响应必须通过下面的信封验证。
      }
      if (controller.signal.aborted) throw controller.signal.reason
      const businessStatus = typeof payload.status === 'number' ? payload.status : undefined
      const status = response.status === 200 ? businessStatus : response.status
      const message =
        typeof payload.message === 'string' && payload.message
          ? payload.message
          : '学苑接口请求失败'
      if (status === 401) {
        options.onUnauthorized?.(token)
        throw ApiError.unauthorized(message)
      }
      if (status === 403) throw ApiError.forbidden(message)
      if (status === 404) throw ApiError.notFound(message)
      if (status !== undefined && status >= 500) throw ApiError.serviceUnavailable(message)
      if (status !== 200) {
        if (status === 400) {
          // 兼容学苑既有的 400 下架响应，不能将 5xx 的 unavailable 文案当作 404。
          if (/不存在|已下架|not found/i.test(message)) throw ApiError.notFound(message)
          throw ApiError.validation(message)
        }
        if (response.status !== 200) throw ApiError.validation(message)
        throw ApiError.serviceUnavailable('学苑接口响应格式不正确')
      }
      if (!Object.hasOwn(payload, 'data') || typeof payload.message !== 'string') {
        throw ApiError.serviceUnavailable('学苑接口响应格式不正确')
      }
      return payload.data
    }
    try {
      return await Promise.race([execute(), aborted])
    } catch (error) {
      if (signal?.aborted) throw signal.reason
      if (error instanceof ApiError) throw error
      if (error instanceof Error && error.name === 'AbortError') throw error
      throw ApiError.serviceUnavailable(
        controller.signal.aborted ? '学苑接口请求超时' : '学苑接口暂时不可用',
      )
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
      controller.signal.removeEventListener('abort', rejectAbort)
    }
  }
}
