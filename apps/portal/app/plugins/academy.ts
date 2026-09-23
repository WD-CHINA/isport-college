import { createAcademyRepository, createHttpClient } from '@isport/api-client'
import type { DataSource, ProductPhase } from '@isport/shared'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
  const serverFetch = import.meta.server ? useRequestEvent()?.fetch : undefined
  const settings = useState<{ dataSource: DataSource; productPhase: ProductPhase } | null>(
    'academy-settings',
    () => null,
  )
  const http = createHttpClient({
    fetch: serverFetch
      ? (input, init) => serverFetch(input instanceof URL ? input.href : input, init)
      : undefined,
    getHeaders: () => ({
      ...requestHeaders,
      ...(auth.session?.token ? { Authorization: auth.session.token } : {}),
    }),
    onUnauthorized: () => auth.clearSession(),
  })
  if (!settings.value) {
    settings.value = await http<{ dataSource: DataSource; productPhase: ProductPhase }>(
      '/api/academy/config',
    )
  }
  const academy = createAcademyRepository(http)
  if (auth.session?.token) {
    try {
      const user = await academy.call('account/me', {})
      auth.updateUser(user)
    } catch (error) {
      if (auth.session) throw error
    }
  }
  return { provide: { academy, academyHttp: http } }
})
