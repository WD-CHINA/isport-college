import { normalizeRoutePath } from '@isport/shared'

export const SITE_URL = 'https://academy.dream-sports.cn'
export const PUBLIC_PAGE_PATHS = [
  '/',
  '/resources',
  '/research',
  '/schools',
  '/teachers',
  '/news',
  '/legal/terms',
  '/legal/privacy',
] as const
const LIST_PATHS = ['/resources', '/research', '/schools', '/teachers', '/news']
const FILTER_KEYS = [
  'category',
  'secondCategoryId',
  'recommendedLevel',
  'bodyPartTagId',
  'resourceType',
  'keyword',
]

/** 保留实际筛选和分页，移除追踪参数、哈希及重复的第一页地址。 */
export function canonicalUrl(path: string, query: Record<string, unknown> = {}): string {
  const normalized = normalizeRoutePath(path)
  const prefix = /^\/en(?:\/|$)/i.test(path) ? '/en' : ''
  const url = new URL(SITE_URL)
  url.pathname = `${prefix}${normalized === '/' ? '' : normalized}` || '/'
  if (LIST_PATHS.includes(normalized)) {
    for (const key of FILTER_KEYS) {
      const value = query[key]
      if (typeof value === 'string' && value.trim()) url.searchParams.set(key, value.trim())
    }
    const page = Number(query.page)
    if (!Array.isArray(query.page) && Number.isSafeInteger(page) && page > 1)
      url.searchParams.set('page', String(page))
  }
  return url.href
}

export function isSearchPage(path: string, query: Record<string, unknown>): boolean {
  return (
    LIST_PATHS.includes(normalizeRoutePath(path)) &&
    typeof query.keyword === 'string' &&
    !!query.keyword.trim()
  )
}

export function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
