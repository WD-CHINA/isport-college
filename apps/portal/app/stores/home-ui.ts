import { defineStore } from 'pinia'

/** 语言路由切换时保留首页筛选，不缓存接口内容。 */
export const useHomeUiStore = defineStore('home-ui', () => {
  const selectedResource = shallowRef('')
  const selectedResearch = shallowRef('')
  const selectedLevel = shallowRef('')
  return { selectedResource, selectedResearch, selectedLevel }
})
