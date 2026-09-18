import type { PageQuery, PageResult } from '../types'

/** 客户端分页：行为与未来服务端 API 分页约定保持一致 */
export function paginate<T>(items: readonly T[], query: PageQuery = {}): PageResult<T> {
  const page = Math.max(1, Math.floor(query.page ?? 1))
  const pageSize = Math.max(1, Math.floor(query.pageSize ?? 10))
  const start = (page - 1) * pageSize

  return {
    list: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}
