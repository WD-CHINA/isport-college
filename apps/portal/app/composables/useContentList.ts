import {
  RESEARCH_CATEGORIES,
  SCHOOL_CATEGORIES,
  WEB_PAGE_SIZE,
  type WebListQuery,
} from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'

const RESEARCH = ['SERIES', 'RESEARCH', 'TOPICS', 'PRODUCTS']
const SCHOOL = ['CURRICULUM', 'DIGITAL']

function scalar(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.trim() : ''
}

function idOf(value: string, pattern: RegExp): string | undefined {
  return pattern.test(value) ? value : undefined
}

export function useContentList(channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const { locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const remoteChannel = toWebChannel(channel)
  const filterRequest = useAsyncData(
    () => `academy:resource-filters:${locale.value}`,
    () => academy.resourceFilters(),
    { immediate: channel === 'resource' },
  )
  const categories = computed(() => {
    if (channel === 'resource') {
      return (filterRequest.data.value?.categoryList ?? []).map(item => ({
        id: item.id,
        name: item.name,
      }))
    }
    const source = channel === 'research' ? RESEARCH_CATEGORIES : SCHOOL_CATEGORIES
    const language = locale.value === 'en' ? 'en-US' : 'zh-CN'
    return source.map(item => ({ id: item.id, name: item.label[language] }))
  })
  const query = computed(() => normalize(route.query))
  const key = computed(
    () => `academy:list:${locale.value}:${channel}:${JSON.stringify(route.query)}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    if (channel === 'resource') await filterRequest
    const current = query.value
    const paging = { keyword: current.keyword, pageNum: current.page, pageSize: WEB_PAGE_SIZE }
    if (remoteChannel === 'RESOURCE') {
      return academy.resources(
        {
          ...paging,
          firstCategoryId: current.category,
          secondCategoryId: current.secondCategoryId,
          recommendedLevel: current.recommendedLevel,
          bodyPartTagId: current.bodyPartTagId,
          type: current.resourceType,
        },
        signal,
      )
    }
    const listed = { ...paging, categoryCode: current.category }
    if (remoteChannel === 'RESEARCH') return academy.research(listed, signal)
    return academy.schools(listed, signal)
  })
  function allowedCategory(value: string) {
    if (channel === 'resource') {
      const known = filterRequest.data.value?.categoryList ?? []
      if (!known.length) return idOf(value, /^\d{1,12}$/)
      return known.some(item => item.id === value) ? value : undefined
    }
    const known = channel === 'research' ? RESEARCH : SCHOOL
    return known.includes(value) ? value : undefined
  }
  function normalize(raw: Record<string, unknown>): WebListQuery {
    const pageValue = scalar(raw.page)
    const page = /^[1-9]\d{0,3}$/.test(pageValue) ? Number(pageValue) : 1
    const category = allowedCategory(scalar(raw.category))
    const keyword = scalar(raw.keyword).slice(0, 100)
    const next: WebListQuery = { page }
    if (category) next.category = category
    if (keyword) next.keyword = keyword
    if (channel !== 'resource') return next
    const second = idOf(scalar(raw.secondCategoryId), /^\d{1,12}$/)
    const level = idOf(scalar(raw.recommendedLevel), /^\d{1,12}$/)
    const body = idOf(scalar(raw.bodyPartTagId), /^\d{1,12}$/)
    const type = idOf(scalar(raw.resourceType), /^[01256]$/)
    const filters = filterRequest.data.value
    if (second && (!filters || filters.secondCategoryList?.some(item => item.id === second)))
      next.secondCategoryId = second
    if (level && (!filters || filters.levelList?.some(item => item.id === level)))
      next.recommendedLevel = level
    if (body && (!filters || filters.bodyPartList?.some(item => item.id === body)))
      next.bodyPartTagId = body
    if (type && (!filters || filters.typeList?.some(item => item.id === type)))
      next.resourceType = type
    return next
  }
  function toUrl(value: WebListQuery) {
    const result: Record<string, string> = {}
    for (const key of [
      'category',
      'keyword',
      'secondCategoryId',
      'recommendedLevel',
      'bodyPartTagId',
      'resourceType',
    ] as const) {
      if (value[key]) result[key] = value[key]
    }
    if (value.page > 1) result.page = String(value.page)
    return result
  }
  function normalizeUrl() {
    const normalized = toUrl(query.value)
    const keys = Object.keys(route.query)
    if (
      keys.length !== Object.keys(normalized).length ||
      keys.some(item => route.query[item] !== normalized[item])
    ) {
      void router.replace({ path: route.path, query: normalized, hash: route.hash })
    }
  }
  onMounted(normalizeUrl)
  watch([() => route.query, filterRequest.data], () => {
    if (import.meta.client) normalizeUrl()
  })
  function update(filters: WebListQuery) {
    return router.push({ path: route.path, query: toUrl({ ...filters, page: 1 }) })
  }
  function changePage(page: number) {
    return router.push({ path: route.path, query: toUrl({ ...query.value, page }) })
  }
  async function retry() {
    if (filterRequest.error.value) await filterRequest.refresh()
    await request.refresh()
  }
  useRefreshOnFocus(retry)
  return { query, request, filterRequest, categories, update, changePage, retry }
}
