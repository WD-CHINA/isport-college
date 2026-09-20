import { describe, expect, it, vi } from 'vitest'

import { createHttpClient } from './client'

/** 构造 JSON 响应 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** 记录请求并返回可编程响应的 fetch 替身 */
function createFetchStub(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) {
  const calls: Array<{ url: string; init: RequestInit }> = []
  const stub = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input)
    const requestInit = init ?? {}
    calls.push({ url, init: requestInit })
    return handler(url, requestInit)
  }) as typeof globalThis.fetch
  return { stub, calls }
}

describe('createHttpClient', () => {
  it('成功响应返回解析后的数据，并拼接 baseURL', async () => {
    const { stub, calls } = createFetchStub(() => jsonResponse({ id: 'c-001' }))
    const client = createHttpClient({ baseURL: 'https://api.example.com', fetch: stub })

    const data = await client<{ id: string }>('/courses/c-001')

    expect(data).toEqual({ id: 'c-001' })
    expect(calls[0]?.url).toBe('https://api.example.com/courses/c-001')
  })

  it('请求前调用 getHeaders 注入请求头', async () => {
    const { stub, calls } = createFetchStub(() => jsonResponse({}))
    const getHeaders = vi.fn(() => ({ Authorization: 'Bearer token-1' }))
    const client = createHttpClient({ getHeaders, fetch: stub })

    await client('/courses')

    expect(getHeaders).toHaveBeenCalledTimes(1)
    expect(new Headers(calls[0]?.init.headers).get('authorization')).toBe('Bearer token-1')
  })

  it('404 响应抛出 NOT_FOUND，透传服务端 message 与 details', async () => {
    const { stub } = createFetchStub(() =>
      jsonResponse({ message: 'Course c-404 not found', details: { courseId: 'c-404' } }, 404),
    )
    const client = createHttpClient({ fetch: stub })

    await expect(client('/courses/c-404')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'NOT_FOUND',
      message: 'Course c-404 not found',
      details: { courseId: 'c-404' },
    })
  })

  it('服务端显式 code 优先于状态码兜底，错误即时抛出（不触发重试）', async () => {
    // GET + 503 属于 ofetch 默认可重试范围；钩子即时抛出应阻止重试（仅发生一次请求）
    const { stub, calls } = createFetchStub(() =>
      jsonResponse({ code: 'VALIDATION_FAILED', message: 'Course is full' }, 503),
    )
    const client = createHttpClient({ fetch: stub })

    await expect(client('/courses/c-001')).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })
    expect(calls).toHaveLength(1)
  })

  it('401 响应触发 onUnauthorized 回调并抛出 UNAUTHORIZED', async () => {
    const { stub } = createFetchStub(() => jsonResponse({}, 401))
    const onUnauthorized = vi.fn()
    const client = createHttpClient({ onUnauthorized, fetch: stub })

    await expect(client('/me')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('网络错误转换为 SERVICE_UNAVAILABLE', async () => {
    const { stub } = createFetchStub(() => Promise.reject(new TypeError('fetch failed')))
    const client = createHttpClient({ fetch: stub })

    await expect(client('/courses')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'SERVICE_UNAVAILABLE',
      message: 'fetch failed',
    })
  })

  it('请求超时转换为 SERVICE_UNAVAILABLE 且提示超时', async () => {
    const { stub } = createFetchStub(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    const client = createHttpClient({ timeout: 30, fetch: stub })

    await expect(client('/slow')).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Request timed out',
    })
  })

  it('用户主动取消保留原始 AbortError', async () => {
    const { stub } = createFetchStub(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init.signal
          if (!signal) return
          if (signal.aborted) reject(signal.reason)
          else signal.addEventListener('abort', () => reject(signal.reason))
        }),
    )
    const client = createHttpClient({ fetch: stub })
    const controller = new AbortController()

    const promise = client('/courses', { signal: controller.signal })
    const assertion = expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
  })

  it('HTTP 200 + 业务 code 200 时解包 data 字段', async () => {
    const { stub } = createFetchStub(() =>
      jsonResponse({ code: 200, msg: 'ok', data: { total: 2 } }),
    )
    const client = createHttpClient({ fetch: stub })

    await expect(client('/courses')).resolves.toEqual({ total: 2 })
  })

  it('HTTP 200 + 业务 code 200 且无 data 时回退 result 字段', async () => {
    const { stub } = createFetchStub(() => jsonResponse({ code: 200, result: ['a', 'b'] }))
    const client = createHttpClient({ fetch: stub })

    await expect(client('/tags')).resolves.toEqual(['a', 'b'])
  })

  it('HTTP 200 + 业务 code 401 触发 onUnauthorized 并抛出 UNAUTHORIZED', async () => {
    const { stub } = createFetchStub(() =>
      jsonResponse({ code: 401, msg: '登录失效！请您重新登录' }),
    )
    const onUnauthorized = vi.fn()
    const client = createHttpClient({ onUnauthorized, fetch: stub })

    await expect(client('/user/account/list')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: '登录失效！请您重新登录',
    })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('HTTP 200 + 业务错误码转换为 ApiError 并透传 msg', async () => {
    const { stub } = createFetchStub(() => jsonResponse({ code: 500, msg: '服务异常！' }))
    const client = createHttpClient({ fetch: stub })

    await expect(client('/user/account/add', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      code: 'SERVICE_UNAVAILABLE',
      message: '服务异常！',
    })
  })

  it('HTTP 错误响应兼容 msg 字段提取错误消息', async () => {
    const { stub } = createFetchStub(() => jsonResponse({ msg: '参数校验失败' }, 400))
    const client = createHttpClient({ fetch: stub })

    await expect(client('/courses')).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      message: '参数校验失败',
    })
  })
})
