/** 把学苑返回的相对资源地址补成可访问的绝对地址。展示层使用。 */
export function resolveApiUrl(value: unknown, baseURL: string): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw || /^https?:\/\//i.test(raw) || !raw.startsWith('/')) return raw
  try {
    return new URL(raw, baseURL).href
  } catch {
    return raw
  }
}

export function useApiUrl() {
  const baseURL = useRuntimeConfig().public.apiBase
  return (value: unknown) => {
    // 同源部署保留接口返回的 /statics 路径，由开发代理或 Nginx 转发。
    if (!/^https?:\/\//i.test(baseURL)) return typeof value === 'string' ? value.trim() : ''
    return resolveApiUrl(value, baseURL)
  }
}
