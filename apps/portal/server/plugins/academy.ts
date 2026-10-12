export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  validateApiBase(config.apiBase, 'NUXT_API_BASE')
  const publicBase = config.public.apiBase
  if (publicBase && publicBase !== '/') validateApiBase(publicBase, 'NUXT_PUBLIC_API_BASE')
})

function validateApiBase(base: string, name: string) {
  let target: URL
  try {
    target = new URL(base)
  } catch {
    throw new Error(`${name} 必须配置为 HTTP/HTTPS 根地址`)
  }
  if (
    !['http:', 'https:'].includes(target.protocol) ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  )
    throw new Error(`${name} 必须配置为 HTTP/HTTPS 根地址`)
}
