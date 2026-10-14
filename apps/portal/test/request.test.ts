import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '../app/api/errors'
import { createRequest } from '../app/api/request'

function envelope(data: unknown, status = 200, httpStatus = 200) {
  return new Response(JSON.stringify({ status, message: status === 200 ? 'OK' : '错误', data }), {
    status: httpStatus,
    headers: { 'content-type': 'application/json' },
  })
}

describe('createRequest', () => {
  it('拼接 /api/v1、注入 Bearer 与语言头，并解包 data', async () => {
    const calls: { url: URL; init: RequestInit }[] = []
    const request = createRequest({
      baseURL: 'http://10.9.0.26:8090',
      getToken: () => 'token-1',
      getLocale: () => 'en-US',
      fetch: async (input, init) => {
        calls.push({ url: new URL(String(input)), init: init ?? {} })
        return envelope({ ok: true })
      },
    })

    await expect(request('GET', '/home')).resolves.toEqual({ ok: true })
    expect(calls[0]?.url.href).toBe('http://10.9.0.26:8090/api/v1/home')
    expect(new Headers(calls[0]?.init.headers).get('authorization')).toBe('Bearer token-1')
    expect(new Headers(calls[0]?.init.headers).get('x-locale')).toBe('en-US')
  })

  it('保留开发代理上游的路径前缀', async () => {
    const calls: string[] = []
    const request = createRequest({
      baseURL: 'https://yuntiyu-test2.dream-sports.cn/academy',
      fetch: async input => {
        calls.push(String(input))
        return envelope({ ok: true })
      },
    })

    await request('GET', '/home')
    expect(calls[0]).toBe('https://yuntiyu-test2.dream-sports.cn/academy/api/v1/home')
  })

  it('401 触发 onUnauthorized', async () => {
    const onUnauthorized = vi.fn()
    const request = createRequest({
      baseURL: 'http://10.9.0.26:8090',
      onUnauthorized,
      fetch: async () => envelope(null, 401, 401),
    })

    await expect(request('GET', '/me')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'UNAUTHORIZED',
    })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('400 保留为校验失败，请求层不解释业务文案', async () => {
    const request = createRequest({
      baseURL: 'http://10.9.0.26:8090',
      fetch: async () =>
        new Response(JSON.stringify({ status: 400, message: '内容不存在或已下架', data: null }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    })

    await expect(request('GET', '/resources/1')).rejects.toBeInstanceOf(ApiError)
    await expect(request('GET', '/resources/1')).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    })
  })

  it('保留 AbortError', async () => {
    const request = createRequest({
      baseURL: 'http://10.9.0.26:8090',
      fetch: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal
          if (!signal) return
          if (signal.aborted) reject(signal.reason)
          else signal.addEventListener('abort', () => reject(signal.reason))
        }),
    })
    const controller = new AbortController()
    const promise = request('GET', '/home', { signal: controller.signal })
    const assertion = expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
  })
})

describe('请求边界回归', () => {
  it('已取消的请求不发送接口', async () => {
    const fetch = vi.fn()
    const request = createRequest({ baseURL: 'http://localhost', fetch })
    const controller = new AbortController()
    controller.abort()
    await expect(request('GET', '/home', { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(fetch).not.toHaveBeenCalled()
  })
  it.each([
    [404, 'Not found', 'NOT_FOUND', 404],
    [503, 'Service unavailable', 'SERVICE_UNAVAILABLE', 503],
    [403, 'Forbidden', 'FORBIDDEN', 403],
  ])('纯文本 HTTP %s 保留状态，不能被文案误分类', async (status, body, code, statusCode) => {
    const request = createRequest({
      baseURL: 'http://localhost',
      fetch: async () => new Response(body, { status }),
    })
    await expect(request('GET', '/home')).rejects.toMatchObject({
      code,
      statusCode,
      data: { code },
    })
  })
  it.each([
    '<html>gateway</html>',
    'null',
    '[]',
    '{"status":200,"message":"OK"}',
    '{"message":"OK","data":{}}',
  ])('拒绝不完整成功信封 %s', async body => {
    const request = createRequest({
      baseURL: 'http://localhost',
      fetch: async () => new Response(body),
    })
    await expect(request('GET', '/home')).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' })
  })
  it('401 回调携带发出请求时的令牌', async () => {
    let token = 'old'
    const onUnauthorized = vi.fn()
    const request = createRequest({
      baseURL: 'http://localhost',
      getToken: () => token,
      onUnauthorized,
      fetch: async () => {
        token = 'new'
        return envelope(null, 401)
      },
    })
    await expect(request('GET', '/me')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(onUnauthorized).toHaveBeenCalledWith('old')
  })
  it('即使底层 fetch 忽略取消也有超时上限', async () => {
    const request = createRequest({
      baseURL: 'http://localhost',
      timeoutMs: 10,
      fetch: () => new Promise<Response>(() => {}),
    })
    await expect(request('GET', '/home')).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
      message: '学苑接口请求超时',
    })
  })
  it('取消后的晚到 401 不触发会话副作用', async () => {
    let resolve!: (response: Response) => void
    const onUnauthorized = vi.fn()
    const request = createRequest({
      baseURL: 'http://localhost',
      onUnauthorized,
      fetch: () =>
        new Promise<Response>(done => {
          resolve = done
        }),
    })
    const controller = new AbortController()
    const pending = request('GET', '/me', { signal: controller.signal })
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
    resolve(envelope(null, 401))
    await new Promise(done => setTimeout(done, 5))
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

it('请求头可被 SSR h3 对象展开保留', async () => {
  const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const merged = { ...init?.headers } as Record<string, string>
    expect(merged.authorization).toBe('Bearer token-1')
    expect(merged['x-locale']).toBe('en-US')
    return envelope(true)
  })
  const request = createRequest({
    baseURL: 'http://localhost',
    getToken: () => 'token-1',
    getLocale: () => 'en-US',
    fetch,
  })
  await expect(request('GET', '/me')).resolves.toBe(true)
})
