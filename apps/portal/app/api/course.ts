import type {
  Course,
  CourseCategory,
  CourseDetail,
  CourseLevel,
  LocalizedText,
  PageResult,
} from '@isport/shared'

import { useApi } from './request'

/** 课程列表查询参数 */
export interface CourseListQuery {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数 */
  pageSize?: number
  /** 按课程名搜索 */
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

/** 平台资源 VO（后端 `/rsp/resource/platform/*` 返回结构） */
interface LearnVideoVO {
  id: number
  name: string
  type: number
  /** 时长（秒） */
  duration: number
  tag?: string
  createDate?: string
  /** 体育水平等级（1-5） */
  recommendedLevel?: number
  systemShared?: boolean
  /** 上传人名称 */
  uploadUser?: string
  viewCount?: number
}

/** 平台资源分页响应（后端分页结构为 rows + total） */
interface TableDataLearnVideo {
  total?: number
  rows?: LearnVideoVO[]
}

/** 课程难度 → 后端体育水平值 */
const LEVEL_TO_RECOMMENDED: Record<CourseLevel, string> = {
  beginner: '1',
  intermediate: '3',
  advanced: '5',
}

function bilingual(value: string): LocalizedText {
  return { 'zh-CN': value, 'en-US': value }
}

function singleLanguage(text: LocalizedText): string {
  return text['zh-CN'] || text['en-US']
}

/** 体育水平（1-5）→ 课程难度近似映射 */
function toLevel(recommendedLevel?: number): CourseLevel {
  if (recommendedLevel === undefined) return 'beginner'
  if (recommendedLevel >= 5) return 'advanced'
  if (recommendedLevel >= 3) return 'intermediate'
  return 'beginner'
}

/**
 * 平台资源 → 课程视图映射。
 * 资源模型没有课程专属字段，按"语义最接近"降级：
 * coach←uploadUser、enrolled←viewCount、capacity←0（不限名额）、price←0（免费）、
 * category 固定 fitness、featured←systemShared。
 */
function toCourse(video: LearnVideoVO): Course {
  return {
    id: String(video.id),
    name: bilingual(video.name),
    category: 'fitness',
    level: toLevel(video.recommendedLevel),
    coach: video.uploadUser ?? '',
    durationMin: Math.max(1, Math.round((video.duration || 0) / 60)),
    capacity: 0,
    enrolled: video.viewCount ?? 0,
    price: 0,
    startDate: video.createDate ?? '',
    location: bilingual(''),
    featured: video.systemShared ?? false,
  }
}

function toCourseDetail(video: LearnVideoVO): CourseDetail {
  return {
    ...toCourse(video),
    description: bilingual(video.tag ?? ''),
    schedule: bilingual(''),
  }
}

/** 课程写载荷 → 后端资源 BO（资源模型不支持的字段丢弃） */
function toResourcePayload(payload: CoursePayload): Record<string, unknown> {
  return {
    name: singleLanguage(payload.name),
    // 0 = 视频类型；firstCategoryId 占位 0：课程分类与后端分类 ID 暂无对应
    type: 0,
    firstCategoryId: 0,
    duration: payload.durationMin * 60,
    recommendedLevel: LEVEL_TO_RECOMMENDED[payload.level],
  }
}

/** 课程列表：POST /rsp/resource/platform/list（category/featured 后端无对应参数，不透传） */
export async function fetchCourseList(query: CourseListQuery = {}): Promise<PageResult<Course>> {
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 10
  const data = await useApi()<TableDataLearnVideo>('/rsp/resource/platform/list', {
    method: 'POST',
    body: {
      name: query.keyword,
      ...(query.level ? { recommendedLevel: LEVEL_TO_RECOMMENDED[query.level] } : {}),
      pageNum: page,
      pageSize,
    },
  })
  const list = (data.rows ?? []).map(toCourse)
  return { list, total: data.total ?? list.length, page, pageSize }
}

/** 课程详情：GET /rsp/resource/platform/detail?id= */
export async function fetchCourseDetail(id: string): Promise<CourseDetail> {
  const video = await useApi()<LearnVideoVO>('/rsp/resource/platform/detail', {
    query: { id: Number(id) },
  })
  return toCourseDetail(video)
}

/** 报名：资源域无报名接口，映射为"浏览 +1" */
export async function enrollCourse(id: string): Promise<void> {
  await useApi()<number>('/rsp/resource/platform/view', {
    method: 'POST',
    query: { id: Number(id) },
  })
}

/** 新建课程：写入平台资源并用返回 id 回填详情 */
export async function createCourse(payload: CoursePayload): Promise<CourseDetail> {
  const id = await useApi()<string | number>('/rsp/resource/platform/add', {
    method: 'POST',
    body: toResourcePayload(payload),
  })
  return fetchCourseDetail(String(id))
}

/** 编辑课程并回填详情 */
export async function updateCourse(id: string, payload: CoursePayload): Promise<CourseDetail> {
  await useApi()<string>('/rsp/resource/platform/edit', {
    method: 'POST',
    body: { id: Number(id), ...toResourcePayload(payload) },
  })
  return fetchCourseDetail(id)
}

/** 删除课程（平台资源） */
export async function deleteCourse(id: string): Promise<void> {
  await useApi()<string>('/rsp/resource/platform/delete', {
    method: 'POST',
    query: { id: Number(id) },
  })
}
