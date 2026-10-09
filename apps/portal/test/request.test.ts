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

  it('业务错误按文案映射 NOT_FOUND', async () => {
    const request = createRequest({
      baseURL: 'http://10.9.0.26:8090',
      fetch: async () =>
        new Response(JSON.stringify({ status: 400, message: '内容不存在或已下架', data: null }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    })

    await expect(request('GET', '/resources/1')).rejects.toBeInstanceOf(ApiError)
    await expect(request('GET', '/resources/1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
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
    const promise = request('GET', '/home', undefined, undefined, controller.signal)
    const assertion = expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
  })
})
