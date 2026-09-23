import { MOCK_RULES } from '@isport/api-client/mock'
import type { ExchangeOrder, PointAccount } from '@isport/shared'

/** 我的积分：读取积分账户、执行兑换并在 Mock 结算后刷新。 */
export function usePoints() {
  const academy = useAcademy()
  const auth = useAuthStore()

  const key = computed(() => `academy:points:${auth.user?.id ?? 'guest'}`)

  const request = useAsyncData(
    key,
    (_app, { signal }) => academy.call('points/account', {}, signal),
    { watch: [key] },
  )

  const account = computed<PointAccount | undefined>(() => request.data.value)
  const exchangeTiers = MOCK_RULES.exchangeTiers
  const exchanging = shallowRef(false)

  function refresh() {
    return request.refresh()
  }

  // 兑换后 Mock 需 ≥1s 才结算，等待一次刷新以回写订单终态与余额。
  async function exchange(amount: number): Promise<ExchangeOrder> {
    exchanging.value = true
    try {
      const requestId = `ex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const order = await academy.call('points/exchange', { amount, requestId })
      await new Promise(resolve => setTimeout(resolve, 1200))
      await request.refresh()
      return order
    } finally {
      exchanging.value = false
    }
  }

  return { request, account, exchangeTiers, exchanging, exchange, refresh }
}
