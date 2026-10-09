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
  return (value: unknown) => resolveApiUrl(value, baseURL)
}
