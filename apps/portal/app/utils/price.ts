/** 价格展示：0 返回 null（由调用方展示“免费”文案），其余带两位小数 */
export function formatPrice(price: number): string | null {
  if (price <= 0) return null
  return `¥${price.toFixed(2)}`
}
