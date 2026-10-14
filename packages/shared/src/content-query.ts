import {
  RESEARCH_CATEGORIES,
  SCHOOL_CATEGORIES,
  type WebListQuery,
  type WebResourceFilters,
} from './web-api'
import type { ContentChannel } from './academy'

function scalar(value: unknown): string {
  // 重复参数不取第一项，避免浏览器与服务端对输入作出不同解释。
  return typeof value === 'string' ? value.trim() : ''
}
export function parseListPage(value: unknown): number {
  const raw = scalar(value)
  return /^[1-9]\d{0,3}$/.test(raw) ? Number(raw) : 1
}
function id(value: unknown): string | undefined {
  const raw = scalar(value)
  return /^\d{1,12}$/.test(raw) ? raw : undefined
}
/** 当前学苑 URL 查询的唯一解析器；未知字段不会进入请求。 */
export function normalizeContentQuery(
  raw: Record<string, unknown>,
  channel: ContentChannel,
  filters?: WebResourceFilters | null,
): WebListQuery {
  const query: WebListQuery = { page: parseListPage(raw.page) }
  const keyword = scalar(raw.keyword).slice(0, 100)
  if (keyword) query.keyword = keyword
  const category = scalar(raw.category)
  if (channel !== 'resource') {
    const categories = channel === 'research' ? RESEARCH_CATEGORIES : SCHOOL_CATEGORIES
    if (categories.some(item => item.id === category)) query.category = category
    if (channel === 'research' && !query.category) query.category = RESEARCH_CATEGORIES[0]?.id
    return query
  }
  if (id(category) && (!filters || filters.categoryList.some(item => item.id === category))) {
    query.category = category
  }
  if (!query.category && filters?.categoryList.length) {
    query.category = filters.categoryList[0]?.id
  }
  const second = id(raw.secondCategoryId)
  if (
    second &&
    (!filters ||
      filters.secondCategoryList.some(
        item => item.id === second && (!query.category || item.parentId === query.category),
      ))
  ) {
    query.secondCategoryId = second
  }
  // 将旧入口的 level 归一化为学苑规定的 recommendedLevel。
  const level = id(raw.recommendedLevel ?? raw.level)
  if (level && (!filters || filters.levelList.some(item => item.id === level))) {
    query.recommendedLevel = level
  }
  const body = id(raw.bodyPartTagId)
  if (
    query.category === '1' &&
    body &&
    (!filters || filters.bodyPartList.some(item => item.id === body))
  ) {
    query.bodyPartTagId = body
  }
  const type = scalar(raw.resourceType)
  if (/^[01256]$/.test(type) && (!filters || filters.typeList.some(item => item.id === type))) {
    query.resourceType = type
  }
  return query
}
export function contentQueryToUrl(query: WebListQuery): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of [
    'category',
    'keyword',
    'secondCategoryId',
    'recommendedLevel',
    'bodyPartTagId',
    'resourceType',
  ] as const) {
    if (query[key]) result[key] = query[key]
  }
  if (query.page > 1) result.page = String(query.page)
  return result
}
