export default defineNuxtRouteMiddleware(to => {
  const settings = useAcademySettings()
  const path = to.path.replace(/^\/en(?=\/|$)/, '')
  const requiresP1 = /^\/admin(?:\/|$)/.test(path) || /^\/account\/teacher(?:\/|$)/.test(path)
  if (requiresP1 && settings.value?.productPhase !== 'p1')
    throw createError({ statusCode: 404, message: 'NOT_FOUND' })
})
