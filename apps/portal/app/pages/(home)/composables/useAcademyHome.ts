import { useRefreshOnVisible } from '~/composables/useRefreshOnVisible'
import { useAcademy } from '~/composables/useAcademy'
import { RESEARCH_CATEGORIES } from '@isport/shared'
import { storeToRefs } from 'pinia'
import { useHomeUiStore } from '~/stores/home-ui'
import { useContentLevelLabel } from '~/composables/useContentLevelLabel'

export function useAcademyHome() {
  const academy = useAcademy()
  const getLevelLabel = useContentLevelLabel()
  const { locale } = useI18n()
  const request = useAsyncData(
    () => `academy:home:${locale.value}`,
    () => academy.home(),
  )
  const { selectedResource, selectedResearch, selectedLevel } = storeToRefs(
    useHomeUiStore(useNuxtApp().$pinia),
  )
  const language = computed(() => (locale.value === 'en' ? 'en-US' : 'zh-CN'))

  function pick(current: string, ids: string[]) {
    return ids.includes(current) ? current : (ids[0] ?? '')
  }

  const resourceGroups = computed(() => request.data.value?.resourceGroupList ?? [])
  const researchCodes = computed(() => RESEARCH_CATEGORIES)

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
  const resourceItems = computed(
    () =>
      resourceGroups.value.find(item => String(item.groupId) === resourceCategory.value)
        ?.itemList ?? [],
  )
  // 筛选名称和卡片适用信息共用同一来源，避免水平分组混入其他分类资源。
  const levelCategories = computed(() =>
    [...new Set(resourceItems.value.map(getLevelLabel).filter(Boolean))].map(name => ({
      id: name,
      name,
    })),
  )
  const levelCategory = computed({
    get: () =>
      levelCategories.value.some(item => item.id === selectedLevel.value)
        ? selectedLevel.value
        : '',
    set: value => {
      selectedLevel.value = value
    },
  })

  useRefreshOnVisible(request.refresh)
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
    levelCategories,
    resourceItems,
    researchItems: computed(() =>
      (request.data.value?.researchList ?? []).filter(
        item => item.categoryCode === researchCategory.value,
      ),
    ),
    levelItems: computed(() =>
      resourceItems.value.filter(item => getLevelLabel(item) === levelCategory.value),
    ),
  }
}
