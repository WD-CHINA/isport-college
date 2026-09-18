/** Mock Repository 通用配置 */
export interface MockOptions {
  /** 模拟请求延迟：固定毫秒数或 [min, max] 区间，默认 0 */
  latency?: number | [number, number]
  /**
   * 演示场景：
   * - normal：正常返回
   * - empty：列表返回空数据
   * - error：所有读操作抛出 SERVICE_UNAVAILABLE
   */
  scenario?: 'normal' | 'empty' | 'error'
}
