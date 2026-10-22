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
import { isNavigationFailure, NavigationFailureType } from 'vue-router'

export function useContentList(channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const { locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const remoteChannel = toWebChannel(channel)
  const pageSize = { resource: 8, research: 4, school: 6 }[channel]
  // 初始键不依赖尚未加载的字典，保证 SSR 与水合一致。
  // 补齐默认分类等 URL 整理不改变实际查询，因此继续复用当前键。
  const keyQuery = shallowRef(contentQueryToUrl(normalizeContentQuery(route.query, channel)))
  const key = computed(
    () => `academy:list:${locale.value}:${channel}:${JSON.stringify(keyQuery.value)}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    // 固定本次参数，筛选项返回前的后续搜索不能改变这次列表请求。
    const raw = { ...route.query }
    const dataLocale = locale.value
    const keyword = normalizeContentQuery(raw, channel).keyword
    const filters =
      channel === 'resource' ? await academy.resourceFilters({ keyword }, signal) : null
    signal.throwIfAborted()
    const current = normalizeContentQuery(raw, channel, filters)
    const paging = {
      keyword: current.keyword,
      pageNum: current.page,
      pageSize,
    }
    if (remoteChannel === 'RESOURCE') {
      const page = await academy.resources(
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
      return { page, filters, keyword, locale: dataLocale }
    }
    const listed = { ...paging, categoryCode: current.category }
    const page =
      remoteChannel === 'RESEARCH'
        ? await academy.research(listed, signal)
        : await academy.schools(listed, signal)
    return { page, filters, keyword, locale: dataLocale }
  })
  const data = computed(() => request.data.value?.page)
  const resourceFilters = computed(() => {
    const result = request.data.value
    const keyword = normalizeContentQuery(route.query, channel).keyword
    return result?.keyword === keyword && result?.locale === locale.value ? result.filters : null
  })
  const categories = computed(() => {
    if (channel === 'resource') return resourceFilters.value?.categoryList ?? []
    const source = channel === 'research' ? RESEARCH_CATEGORIES : SCHOOL_CATEGORIES
    return source.map(item => ({ id: item.id, name: item.label[resolveDataLocale(locale.value)] }))
  })
  const query = computed(() => normalizeContentQuery(route.query, channel, resourceFilters.value))
  watch(
    () => route.query,
    (next, previous) => {
      const normalize = (raw: Record<string, unknown>) =>
        JSON.stringify(
          contentQueryToUrl(normalizeContentQuery(raw, channel, resourceFilters.value)),
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
  watch([() => route.query, resourceFilters], () => {
    if (import.meta.client && mounted) void normalizeUrl()
  })
  function update(filters: WebListQuery) {
    return router.push({ path: route.path, query: contentQueryToUrl({ ...filters, page: 1 }) })
  }
  async function search(keyword: string) {
    const normalized = keyword.trim().slice(0, 100) || undefined
    const filters =
      channel === 'resource'
        ? {
            page: 1,
            keyword: normalized,
          }
        : { ...query.value, keyword: normalized }
    const previousKey = key.value
    const navigation = await update(filters)
    if (
      isNavigationFailure(navigation, NavigationFailureType.duplicated) ||
      (!navigation && key.value === previousKey)
    ) {
      await request.refresh()
      return true
    }
    return !navigation
  }
  function changePage(page: number) {
    return router.push({ path: route.path, query: contentQueryToUrl({ ...query.value, page }) })
  }
  async function retry() {
    await request.refresh()
  }
  useRefreshOnVisible(retry)
  return {
    query,
    request,
    data,
    resourceFilters,
    categories,
    update,
    search,
    changePage,
    retry,
  }
}
