import { describe, expect, it } from 'vitest'

import { createAcademyClient } from '../app/api/academy'
import { ApiError } from '../app/api/errors'
import { createRequest, type RequestOptions } from '../app/api/request'
import { createAcademyDataClient } from '../app/utils/academy-data'

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

  it('点赞走 /actions/like，下架内容由内容适配层视为不存在', async () => {
    const calls: { path: string; authorization: string | null; body: string }[] = []
    const client = createAcademyDataClient(
      clientOf({
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
      }),
    )
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

  it.each([200, 400])(
    'HTTP %s 下的内容下架错误保持 404，登录错误仍为校验失败',
    async httpStatus => {
      const client = createAcademyDataClient(
        clientOf({
          fetch: async () =>
            new Response(
              JSON.stringify({ status: 400, message: '内容不存在或已下架', data: null }),
              { status: httpStatus },
            ),
        }),
      )
      await expect(client.content('RESOURCE', 9)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      })
      await expect(client.teacher(9)).rejects.toMatchObject({ code: 'NOT_FOUND', statusCode: 404 })
      await expect(client.newsDetail(9)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      })
      await expect(
        client.login({ phone: '13800138000', code: '000000', agreed: true }),
      ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })
      await expect(client.resourceFilters()).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })
    },
  )

  it('内容接口的普通 400 与 503 不因文案被误判为下架', async () => {
    const client = createAcademyDataClient(
      clientOf({
        fetch: async () =>
          new Response(JSON.stringify({ status: 400, message: '参数不正确', data: null })),
      }),
    )
    await expect(client.content('RESOURCE', 1)).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })
    const unavailable = createAcademyDataClient(
      clientOf({
        fetch: async () =>
          new Response(JSON.stringify({ status: 400, message: '内容不存在', data: null }), {
            status: 503,
          }),
      }),
    )
    await expect(unavailable.content('RESOURCE', 1)).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    })
  })

  it('查询参数通过命名选项发送，不进入请求体', async () => {
    const calls: { url: URL; init: RequestInit }[] = []
    const client = clientOf({
      fetch: async (input, init) => {
        calls.push({ url: new URL(String(input)), init: init ?? {} })
        return envelope({ ok: true })
      },
    })
    await client.resources({ pageNum: 2, pageSize: 12 })
    expect(calls[0]?.url.searchParams.get('pageNum')).toBe('2')
    expect(calls[0]?.url.searchParams.get('pageSize')).toBe('12')
    expect(calls[0]?.init.body).toBeUndefined()
  })
})
