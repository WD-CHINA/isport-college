import { POINT_EXCHANGE_TIERS } from '@isport/shared'
import type { ExchangeOrder, PointAccount } from '@isport/shared'

/** 我的积分。兑换接口不在学苑前台文档中。 */
export function usePoints() {
  const auth = useAuthStore()
  const key = computed(() => `academy:points:${auth.user?.id ?? 'guest'}`)
  const request = useAsyncData(
    key,
    (_app, { signal }) => academyUnavailable<PointAccount>('points/account', {}, signal),
    { watch: [key] },
  )
  const account = computed(() => request.data.value)
  const exchanging = shallowRef(false)

  async function exchange(amount: number): Promise<ExchangeOrder> {
    exchanging.value = true
    try {
      return await academyUnavailable<ExchangeOrder>('points/exchange', {
        amount,
        requestId: `ex-${Date.now()}`,
      })
    } finally {
      exchanging.value = false
    }
  }

  return {
    request,
    account,
    exchangeTiers: POINT_EXCHANGE_TIERS,
    exchanging,
    exchange,
    refresh: () => request.refresh(),
  }
}
