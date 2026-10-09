import type { PageResult, Work, WorkStatus } from '@isport/shared'

export function useMyWorks() {
  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()
  const localePath = useLocalePath()
  const status = computed(() => {
    const value = route.query.status
    return typeof value === 'string' && value ? (value as WorkStatus) : undefined
  })
  const page = computed(() => {
    const value = Number(route.query.page ?? 1)
    return Number.isFinite(value) && value > 0 ? value : 1
  })
  const key = computed(
    () => `academy:works:${auth.user?.id ?? 'guest'}:${page.value}:${status.value ?? 'all'}`,
  )
  const request = useAsyncData<PageResult<Work>>(
    key,
    (_app, { signal }) =>
      academyUnavailable(
        'work/list',
        {
          page: page.value,
          pageSize: 12,
          status: status.value,
        },
        signal,
      ),
    { watch: [page, status] },
  )

  function replace(query: Record<string, string>) {
    void router.replace({ path: localePath('/admin/works'), query })
  }

  return {
    request,
    status,
    page,
    filterStatus(next?: WorkStatus) {
      replace(next ? { status: next } : {})
    },
    changePage(next: number) {
      replace({
        ...(status.value ? { status: status.value } : {}),
        page: String(next),
      })
    },
  }
}
