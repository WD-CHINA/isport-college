import {
  RESEARCH_CATEGORIES,
  SCHOOL_CATEGORIES,
  contentQueryToUrl,
  normalizeContentQuery,
  resolveDataLocale,
  type WebListQuery,
} from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'
import { useAcademy } from '~/composables/useAcademy'
import { useRefreshOnVisible } from '~/composables/useRefreshOnVisible'

export function useContentList(channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const { locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const remoteChannel = toWebChannel(channel)
  const pageSize = { resource: 8, research: 4, school: 6 }[channel]
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
  // 初始键不依赖尚未加载的字典，保证 SSR 与水合一致。
  // 补齐默认分类等 URL 整理不改变实际查询，因此继续复用当前键。
  const keyQuery = shallowRef(contentQueryToUrl(normalizeContentQuery(route.query, channel)))
  const key = computed(
    () => `academy:list:${locale.value}:${channel}:${JSON.stringify(keyQuery.value)}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    if (channel === 'resource') await filterRequest
    const current = query.value
    const paging = {
      keyword: current.keyword,
      pageNum: current.page,
      pageSize,
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
  watch(
    () => route.query,
    (next, previous) => {
      const normalize = (raw: Record<string, unknown>) =>
        JSON.stringify(
          contentQueryToUrl(normalizeContentQuery(raw, channel, filterRequest.data.value)),
        )
      if (normalize(next) !== normalize(previous)) {
        keyQuery.value = contentQueryToUrl(normalizeContentQuery(next, channel))
      }
    },
    { flush: 'sync' },
  )
  let mounted = false
  function normalizeUrl() {
    const normalized = contentQueryToUrl(query.value)
    const keys = Object.keys(route.query)
    if (
      keys.length !== Object.keys(normalized).length ||
      keys.some(item => route.query[item] !== normalized[item])
    ) {
      return router.replace({ path: route.path, query: normalized, hash: route.hash })
    }
  }
  onMounted(async () => {
    mounted = true
    const path = route.path
    const navigation = normalizeUrl()
    if (!navigation || (await navigation)) return
    // 首次进入时补齐参数会取消 Nuxt 的回顶；在本次替换成功后补回滚动。
    if (router.currentRoute.value.path === path && !router.currentRoute.value.hash) {
      window.scrollTo({ left: 0, top: 0 })
    }
  })
  watch([() => route.query, filterRequest.data], () => {
    if (import.meta.client && mounted) void normalizeUrl()
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
  useRefreshOnVisible(retry)
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
