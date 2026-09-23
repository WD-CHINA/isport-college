import {
  contentQueryToUrl,
  normalizeContentQuery,
  type ContentChannel,
  type ContentQuery,
} from '@isport/shared'

export function useContentList(channel: ContentChannel) {
  const academy = useAcademy()
  const route = useRoute()
  const router = useRouter()
  const taxonomyRequest = useAsyncData('academy:taxonomies', () =>
    academy.call('content/taxonomies', {}),
  )
  const query = computed(() =>
    normalizeContentQuery(route.query, channel, taxonomyRequest.data.value ?? []),
  )
  const key = computed(() => `academy:list:${channel}:${JSON.stringify(route.query)}`)
  const request = useAsyncData(key, async (_app, { signal }) => {
    await taxonomyRequest
    return academy.call('content/list', query.value, signal)
  })
  function normalizeUrl() {
    if (!taxonomyRequest.data.value) return
    const normalized = contentQueryToUrl(query.value)
    const keys = Object.keys(route.query)
    if (
      keys.length !== Object.keys(normalized).length ||
      keys.some(key => route.query[key] !== normalized[key])
    ) {
      void router.replace({ path: route.path, query: normalized, hash: route.hash })
    }
  }
  onMounted(normalizeUrl)
  watch([() => route.query, taxonomyRequest.data], () => {
    if (import.meta.client) normalizeUrl()
  })
  function update(filters: ContentQuery) {
    const next = normalizeContentQuery(
      { ...filters, page: 1 },
      channel,
      taxonomyRequest.data.value ?? [],
    )
    return router.push({ path: route.path, query: contentQueryToUrl(next) })
  }
  function changePage(page: number) {
    return router.push({ path: route.path, query: contentQueryToUrl({ ...query.value, page }) })
  }
  async function retry() {
    if (taxonomyRequest.error.value) await taxonomyRequest.refresh()
    await request.refresh()
  }
  useRefreshOnFocus(retry)
  return { query, request, taxonomyRequest, update, changePage, retry }
}
