import type { LocaleCode } from './constants'
import type { Role } from './types'

/** 双语文案：键为 Locale，日期以外的多语言数据统一使用该结构 */
export type LocalizedText = Record<LocaleCode, string>

export type CourseCategory = 'fitness' | 'ball' | 'swim' | 'dance' | 'outdoor'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export const COURSE_CATEGORIES: readonly CourseCategory[] = [
  'fitness',
  'ball',
  'swim',
  'dance',
  'outdoor',
]

export const COURSE_LEVELS: readonly CourseLevel[] = ['beginner', 'intermediate', 'advanced']

/** 课程列表项 */
export interface Course {
  id: string
  name: LocalizedText
  category: CourseCategory
  level: CourseLevel
  coach: string
  /** 单次课时长（分钟） */
  durationMin: number
  /** 总名额 */
  capacity: number
  /** 已报名人数 */
  enrolled: number
  /** 价格（元），0 表示免费 */
  price: number
  /** 开课日期，ISO 8601 */
  startDate: string
  location: LocalizedText
  featured: boolean
}

/** 课程详情 */
export interface CourseDetail extends Course {
  description: LocalizedText
  schedule: LocalizedText
}

/** 用户 */
export interface User {
  id: string
  phone: string
  name: string
  roles: Role[]
}

/** 登录会话 */
export interface AuthSession {
  user: User
  token: string
  /** 签发时间，ISO 8601 */
  issuedAt: string
}

/** 管理端仪表盘统计 */
export interface DashboardStats {
  totalCourses: number
  totalEnrollments: number
  totalCoaches: number
  totalStudents: number
}
