import {
  RESEARCH_CATEGORIES,
  SCHOOL_CATEGORIES,
  WEB_PAGE_SIZE,
  contentQueryToUrl,
  normalizeContentQuery,
  resolveDataLocale,
  type WebListQuery,
} from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'
import { useAcademy } from '~/composables/useAcademy'
import { useRefreshOnFocus } from '~/composables/useRefreshOnFocus'

export function useContentList(channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const { locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const remoteChannel = toWebChannel(channel)
  const filterRequest = useAsyncData(
    () => `academy:resource-filters:${locale.value}`,
    (_app, { signal }) => academy.resourceFilters(undefined, signal),
    { immediate: channel === 'resource' },
  )
  const categories = computed(() => {
    if (channel === 'resource') return filterRequest.data.value?.categoryList ?? []
    const source = channel === 'research' ? RESEARCH_CATEGORIES : SCHOOL_CATEGORIES
    return source.map(item => ({ id: item.id, name: item.label[resolveDataLocale(locale.value)] }))
  })
  const query = computed(() =>
    normalizeContentQuery(route.query, channel, filterRequest.data.value),
  )
  const key = computed(
    () =>
      // SSR 尚未取得分类字典时也必须与浏览器使用同一键。
      `academy:list:${locale.value}:${channel}:${JSON.stringify(contentQueryToUrl(normalizeContentQuery(route.query, channel)))}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    if (channel === 'resource') await filterRequest
    const current = query.value
    const paging = {
      keyword: current.keyword,
      pageNum: current.page,
      pageSize: WEB_PAGE_SIZE,
    }
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
    return remoteChannel === 'RESEARCH'
      ? academy.research(listed, signal)
      : academy.schools(listed, signal)
  })
  function normalizeUrl() {
    const normalized = contentQueryToUrl(query.value)
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
    return router.push({ path: route.path, query: contentQueryToUrl({ ...filters, page: 1 }) })
  }
  function search(keyword: string) {
    const normalized = keyword.trim().slice(0, 100) || undefined
    const filters =
      channel === 'resource'
        ? {
            page: 1,
            category: categories.value[0]?.id,
            recommendedLevel: query.value.recommendedLevel,
            keyword: normalized,
          }
        : { ...query.value, keyword: normalized }
    return update(filters)
  }
  function changePage(page: number) {
    return router.push({ path: route.path, query: contentQueryToUrl({ ...query.value, page }) })
  }
  async function retry() {
    if (filterRequest.error.value) await filterRequest.refresh()
    await request.refresh()
  }
  useRefreshOnFocus(retry)
  return {
    query,
    request,
    filterRequest,
    categories,
    update,
    search,
    changePage,
    retry,
  }
}
