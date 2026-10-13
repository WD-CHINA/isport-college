import { useRefreshOnFocus } from '~/composables/useRefreshOnFocus'
import { useAcademy } from '~/composables/useAcademy'
import { RESEARCH_CATEGORIES } from '@isport/shared'

export function useAcademyHome() {
  const academy = useAcademy()
  const { locale } = useI18n()
  const request = useAsyncData(
    () => `academy:home:${locale.value}`,
    () => academy.home(),
  )
  const selectedResource = shallowRef('')
  const selectedResearch = shallowRef('')
  const selectedLevel = shallowRef('')
  const language = computed(() => (locale.value === 'en' ? 'en-US' : 'zh-CN'))

  function pick(current: string, ids: string[]) {
    return ids.includes(current) ? current : (ids[0] ?? '')
  }

  const resourceGroups = computed(() => request.data.value?.resourceGroupList ?? [])
  const levelGroups = computed(() => request.data.value?.levelGroupList ?? [])
  const researchCodes = computed(() => {
    const present = new Set(
      (request.data.value?.researchList ?? []).map(item => item.categoryCode).filter(Boolean),
    )
    const source = RESEARCH_CATEGORIES.filter(item => present.size === 0 || present.has(item.id))
    return source.length ? source : RESEARCH_CATEGORIES
  })

  const resourceCategory = computed({
    get: () =>
      pick(
        selectedResource.value,
        resourceGroups.value.map(item => String(item.groupId)),
      ),
    set: value => {
      selectedResource.value = value
    },
  })
  const researchCategory = computed({
    get: () =>
      pick(
        selectedResearch.value,
        researchCodes.value.map(item => item.id),
      ),
    set: value => {
      selectedResearch.value = value
    },
  })
  const levelCategory = computed({
    get: () => selectedLevel.value,
    set: value => {
      selectedLevel.value = value
    },
  })

  useRefreshOnFocus(request.refresh)
  return {
    request,
    resourceCategory,
    researchCategory,
    levelCategory,
    resourceCategories: computed(() =>
      resourceGroups.value.map(item => ({ id: String(item.groupId), name: item.groupName })),
    ),
    researchCategories: computed(() =>
      researchCodes.value.map(item => ({ id: item.id, name: item.label[language.value] })),
    ),
    levelCategories: computed(() =>
      levelGroups.value.map(item => ({ id: String(item.groupId), name: item.groupName })),
    ),
    resourceItems: computed(
      () =>
        resourceGroups.value.find(item => String(item.groupId) === resourceCategory.value)
          ?.itemList ?? [],
    ),
    researchItems: computed(() =>
      (request.data.value?.researchList ?? []).filter(
        item => item.categoryCode === researchCategory.value,
      ),
    ),
    levelItems: computed(
      () =>
        levelGroups.value.find(item => String(item.groupId) === levelCategory.value)?.itemList ??
        [],
    ),
  }
}
