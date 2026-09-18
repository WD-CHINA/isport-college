import type {
  Course,
  CourseCategory,
  CourseDetail,
  CourseLevel,
  LocalizedText,
  PageQuery,
  PageResult,
} from '@isport/shared'

/** 课程列表查询：行为与未来 API 约定保持一致 */
export interface CourseListQuery extends PageQuery {
  /** 按课程名或教练搜索（大小写不敏感） */
  keyword?: string
  category?: CourseCategory
  level?: CourseLevel
  /** 仅返回精选课程 */
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

/**
 * 课程 Repository 接口。
 * 页面与组件只依赖本接口，不感知 Mock 或 HTTP 实现。
 */
export interface CourseRepository {
  list(query: CourseListQuery): Promise<PageResult<Course>>
  getById(id: string): Promise<CourseDetail>
  /** 报名：受保护操作，满员时抛出 VALIDATION_FAILED */
  enroll(id: string): Promise<void>
  create(payload: CoursePayload): Promise<CourseDetail>
  update(id: string, payload: CoursePayload): Promise<CourseDetail>
  remove(id: string): Promise<void>
}
