import type { WorkStatus } from '@isport/shared'

export function useMyWorks() {
  const academy = useAcademy()
  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()
  const localePath = useLocalePath()

  const status = computed(() => {
    const s = route.query.status
    return typeof s === 'string' && s ? (s as WorkStatus) : undefined
  })

  const page = computed(() => {
    const p = Number(route.query.page ?? 1)
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  const key = computed(
    () => `academy:works:${auth.user?.id ?? 'guest'}:${page.value}:${status.value ?? 'all'}`,
  )

  const request = useAsyncData(
    key,
    (_app, { signal }) =>
      academy.call('work/list', { page: page.value, pageSize: 12, status: status.value }, signal),
    { watch: [page, status] },
  )

  function filterStatus(s?: WorkStatus) {
    void router.replace({
      path: localePath('/admin/works'),
      query: { ...(s ? { status: s } : {}), ...(page.value > 1 ? {} : {}) },
    })
  }

  function changePage(p: number) {
    void router.replace({
      path: localePath('/admin/works'),
      query: { ...(status.value ? { status: status.value } : {}), page: String(p) },
    })
  }

  useRefreshOnFocus(() => request.refresh())

  return { request, status, page, filterStatus, changePage }
}
