export function useAcademyHome() {
  const academy = useAcademy()
  const request = useAsyncData('academy:home', () => academy.call('content/home', {}))
  const resourceCategory = shallowRef('fitness')
  const researchCategory = shallowRef('practice')
  const resourceCategories = computed(
    () => request.data.value?.taxonomies.filter(item => item.channel === 'resource') ?? [],
  )
  const researchCategories = computed(
    () => request.data.value?.taxonomies.filter(item => item.channel === 'research') ?? [],
  )
  watch(resourceCategories, items => {
    if (!items.some(item => item.id === resourceCategory.value))
      resourceCategory.value = items[0]?.id ?? ''
  })
  watch(researchCategories, items => {
    if (!items.some(item => item.id === researchCategory.value))
      researchCategory.value = items[0]?.id ?? ''
  })
  useRefreshOnFocus(request.refresh)
  return { request, resourceCategory, researchCategory, resourceCategories, researchCategories }
}
