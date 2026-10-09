import { describe, expect, it } from 'vitest'

import { createAcademyClient } from '../app/api/academy'
import { ApiError } from '../app/api/errors'
import { createRequest, type RequestOptions } from '../app/api/request'

function envelope(data: unknown, status = 200) {
  return new Response(JSON.stringify({ status, message: status === 200 ? 'OK' : '错误', data }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function clientOf(options: Omit<RequestOptions, 'baseURL'> & { baseURL?: string }) {
  const baseURL = options.baseURL ?? 'http://10.9.0.26:8090'
  return createAcademyClient(createRequest({ ...options, baseURL }))
}

describe('createAcademyClient', () => {
  it('登录只提交文档字段', async () => {
    const calls: { url: URL; init: RequestInit }[] = []
    const client = clientOf({
      getLocale: () => 'zh-CN',
      fetch: async (input, init) => {
        calls.push({ url: new URL(String(input)), init: init ?? {} })
        return envelope({ token: 'token-1', newUser: true, profile: { id: 8 } })
      },
    })
    const session = await client.login({ phone: '13800138000', code: '123456', agreed: true })
    expect(session).toMatchObject({ token: 'token-1', newUser: true })
    expect(calls[0]?.url.pathname).toBe('/api/v1/auth/login')
    expect(String(calls[0]?.init.body)).toBe(
      JSON.stringify({ phone: '13800138000', code: '123456', agreed: true }),
    )
    expect(new Headers(calls[0]?.init.headers).get('X-Locale')).toBe('zh-CN')
  })

  it('点赞走 /actions/like，下架内容由请求层视为不存在', async () => {
    const calls: { path: string; authorization: string | null; body: string }[] = []
    const client = clientOf({
      getToken: () => 'token-1',
      fetch: async (input, init) => {
        const url = new URL(String(input))
        calls.push({
          path: url.pathname,
          authorization: new Headers(init?.headers).get('Authorization'),
          body: String(init?.body ?? ''),
        })
        if (url.pathname.endsWith('/actions/like')) return envelope({ active: true, count: 4 })
        return new Response(
          JSON.stringify({ status: 400, message: '内容不存在或已下架', data: null }),
          { status: 400, headers: { 'content-type': 'application/json' } },
        )
      },
    })
    const target = { channel: 'RESOURCE' as const, origin: 'PLATFORM' as const, originId: 5 }
    await expect(client.like(target)).resolves.toEqual({ active: true, count: 4 })
    expect(calls[0]).toMatchObject({
      path: '/api/v1/actions/like',
      authorization: 'Bearer token-1',
      body: JSON.stringify(target),
    })
    await expect(client.content('RESOURCE', 9)).rejects.toBeInstanceOf(ApiError)
    await expect(client.content('RESOURCE', 9)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
