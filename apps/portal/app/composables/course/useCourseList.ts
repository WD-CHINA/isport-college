import type { CourseListQuery } from '@isport/api-client'
import type { Course, PageResult } from '@isport/shared'

interface UseCourseListOptions {
  /** useAsyncData 缓存键，页面内唯一 */
  key: string
  /** 查询参数：支持 ref / getter / 普通值，变化时自动重新请求 */
  query: MaybeRefOrGetter<CourseListQuery>
}

/** 课程列表：只依赖 CourseRepository 接口，不感知 Mock/HTTP 实现 */
export function useCourseList(options: UseCourseListOptions) {
  const { $courseRepository } = useNuxtApp()

  return useAsyncData<PageResult<Course>>(
    options.key,
    () => $courseRepository.list(toValue(options.query)),
    {
      watch: [() => toValue(options.query)],
      deep: true,
    },
  )
}
