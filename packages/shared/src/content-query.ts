import {
  BODY_PARTS,
  FITNESS_CATEGORIES,
  type ContentChannel,
  type ContentQuery,
  type Taxonomy,
} from './academy'

export const CONTENT_PAGE_SIZE = 12
export const RESOURCE_FILTER_KINDS = ['video', 'courseware', 'audio', 'image'] as const

function scalar(value: unknown): string {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : ''
}

/** URL 是不可信输入；重复参数、跨栏目分类和失效筛选不进入业务查询。 */
export function normalizeContentQuery(
  raw: Record<string, unknown>,
  channel: ContentChannel,
  taxonomies: readonly Taxonomy[],
): ContentQuery {
  const categories = taxonomies.filter(item => item.enabled && item.channel === channel)
  const requestedCategory = scalar(raw.category)
  const category = categories.some(item => item.id === requestedCategory)
    ? requestedCategory
    : channel === 'resource'
      ? (categories.find(item => item.id === 'fitness')?.id ?? categories[0]?.id)
      : undefined
  const pageValue = scalar(raw.page)
  const page = /^[1-9]\d{0,3}$/.test(pageValue) ? Number(pageValue) : 1
  const keyword = scalar(raw.keyword).slice(0, 100)
  const query: ContentQuery = { channel, page, pageSize: CONTENT_PAGE_SIZE }
  if (category) query.category = category
  if (keyword) query.keyword = keyword
  if (channel === 'resource') {
    const level = scalar(raw.level)
    if (/^[1-5]\.0$/.test(level) || /^[1-5]$/.test(level)) query.level = Number(level)
    const kind = RESOURCE_FILTER_KINDS.find(item => item === scalar(raw.kind))
    if (kind) query.kind = kind
    if (category === 'fitness') {
      const fitness = FITNESS_CATEGORIES.find(item => item === scalar(raw.fitness))
      const bodyPart = BODY_PARTS.find(item => item === scalar(raw.bodyPart))
      if (fitness) query.fitness = fitness
      if (bodyPart) query.bodyPart = bodyPart
    }
  }
  return query
}

export function contentQueryToUrl(query: ContentQuery): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of ['category', 'keyword', 'level', 'kind', 'fitness', 'bodyPart'] as const) {
    if (query[key] !== undefined && query[key] !== '') result[key] = String(query[key])
  }
  if (query.page && query.page > 1) result.page = String(query.page)
  return result
}
