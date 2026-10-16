import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

let initialize: () => void
beforeAll(async () => {
  vi.stubGlobal('defineNitroPlugin', (callback: () => void) => {
    initialize = callback
    return callback
  })
  await import('../server/plugins/academy')
})
afterEach(() => vi.unstubAllGlobals())

describe('学苑上游启动检查', () => {
  it.each([
    'http://api.example:8090',
    'https://api.example/',
    'https://yuntiyu-test2.dream-sports.cn/academy',
  ])('固定上游 %s 支持浏览器同源配置', apiBase => {
    vi.stubGlobal('useRuntimeConfig', () => ({ apiBase, public: { apiBase: '/' } }))
    expect(() => initialize()).not.toThrow()
  })
  it.each([
    '',
    '/',
    '//api.example',
    'ftp://api.example',
    'https://user:pass@api.example',
    'https://api.example/../secret',
    'https://api.example/?secret=1',
    'https://api.example/#hash',
  ])('拒绝无效或未配置的 SSR 上游 %s', apiBase => {
    vi.stubGlobal('useRuntimeConfig', () => ({ apiBase, public: { apiBase: '/' } }))
    expect(() => initialize()).toThrow('NUXT_API_BASE 必须配置为 HTTP/HTTPS 地址')
  })
  it.each(['', '/', 'https://browser-api.example', '//browser-api.example'])(
    '启动检查不读取浏览器接口地址 %s',
    apiBase => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        apiBase: 'http://server-api.example',
        public: { apiBase },
      }))
      expect(() => initialize()).not.toThrow()
    },
  )
})
