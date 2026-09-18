/** 可配置请求延迟，用于 Mock Repository 模拟网络耗时。 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 解析延迟配置：固定值或 [min, max] 区间。 */
export function resolveLatency(latency?: number | [number, number]): number {
  if (latency === undefined) return 0
  if (typeof latency === 'number') return Math.max(0, latency)
  const [min, max] = latency
  return Math.max(0, Math.floor(min + Math.random() * (max - min)))
}
