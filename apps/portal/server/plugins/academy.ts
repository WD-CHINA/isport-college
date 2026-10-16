export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  validateApiBase(config.apiBase, 'NUXT_API_BASE')
})

function validateApiBase(base: string, name: string) {
  let target: URL
  try {
    target = new URL(base)
  } catch {
    throw new Error(`${name} 必须配置为 HTTP/HTTPS 地址`)
  }
  // URL 会先消掉 ..，所以用原始路径判断。允许 /academy 这类部署前缀。
  const rawPath = base.replace(/^https?:\/\/[^/?#]+/i, '').split(/[?#]/)[0] ?? ''
  const segments = rawPath.split('/').filter(Boolean)
  if (
    !['http:', 'https:'].includes(target.protocol) ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    segments.some(segment => segment === '.' || segment === '..')
  ) {
    throw new Error(`${name} 必须配置为 HTTP/HTTPS 地址`)
  }
}
