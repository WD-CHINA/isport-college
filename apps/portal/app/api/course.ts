import type {
  Course,
  CourseCategory,
  CourseDetail,
  CourseLevel,
  LocalizedText,
  PageResult,
} from '@isport/shared'

import { ApiError } from './errors'

/** 课程列表查询参数 */
export interface CourseListQuery {
  page?: number
  pageSize?: number
  keyword?: string
  category?: CourseCategory
  level?: CourseLevel
  featured?: boolean
}

/** 管理端新建/编辑课程载荷 */
export interface CoursePayload {
  name: LocalizedText
  category: CourseCategory
  level: CourseLevel
  coach: string
  durationMin: number
  capacity: number
  price: number
  startDate: string
  location: LocalizedText
  description: LocalizedText
  schedule: LocalizedText
  featured: boolean
}

function unavailable(): never {
  throw ApiError.serviceUnavailable('旧资源接口已隔离')
}

/** 旧 `/rsp` 课程接口已隔离，统一走学苑请求后不再单独挂拦截器。 */
export async function fetchCourseList(_query: CourseListQuery = {}): Promise<PageResult<Course>> {
  unavailable()
}

export async function fetchCourseDetail(_id: string): Promise<CourseDetail> {
  unavailable()
}

export async function enrollCourse(_id: string): Promise<void> {
  unavailable()
}

export async function createCourse(_payload: CoursePayload): Promise<CourseDetail> {
  unavailable()
}

export async function updateCourse(_id: string, _payload: CoursePayload): Promise<CourseDetail> {
  unavailable()
}

export async function deleteCourse(_id: string): Promise<void> {
  unavailable()
}
