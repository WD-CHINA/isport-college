import type { CourseListQuery } from '~/api/course'
import { fetchCourseList } from '~/api/course'
import type { Course, PageResult } from '@isport/shared'

interface UseCourseListOptions {
  /** useAsyncData 缓存键，页面内唯一 */
  key: string
  /** 查询参数：支持 ref / getter / 普通值，变化时自动重新请求 */
  query: MaybeRefOrGetter<CourseListQuery>
}

/** 课程列表：真实平台资源接口，响应经 useAsyncData 缓存供 SSR/CSR 复用 */
export function useCourseList(options: UseCourseListOptions) {
  return useAsyncData<PageResult<Course>>(
    options.key,
    () => fetchCourseList(toValue(options.query)),
    {
      watch: [() => toValue(options.query)],
      deep: true,
    },
  )
}
