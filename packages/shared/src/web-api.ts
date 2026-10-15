/** 融梦学苑 C 端前台接口模型，字段与 `/api/v1` 文档一致。 */

export type WebChannel = 'RESOURCE' | 'RESEARCH' | 'SCHOOL'
export type WebOrigin = 'PLATFORM' | 'ACADEMY'
export type WebDetailType = 'ARTICLE' | 'LINK' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'IMAGE'
export type WebMediaType = 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'IMAGE'
export type WebAction = 'LIKE' | 'FAVORITE'

export interface WebContentCard {
  channel: WebChannel
  origin: WebOrigin
  originId: number
  contentKey: string
  title: string
  summary: string
  coverUrl: string
  detailType: WebDetailType
  jumpUrl?: string
  categoryCode: string
  categoryName: string
  authorName: string
  publisherName: string
  levelName: string
  recommendedLevel: number | null
  provinceName: string
  schoolName: string
  viewCount: number
  likeCount: number
  favoriteCount: number
  interactive: boolean
  publishedAt: number | null
}

export interface WebMediaItem {
  mediaType: WebMediaType
  fileUrl: string
  coverUrl: string
  durationSec: number | null
  pageCount: number | null
}

export interface WebContentDetail extends WebContentCard {
  description: string
  htmlBody: string
  jumpUrl: string
  resourceType: number | null
  mediaList: WebMediaItem[]
  liked: boolean
  favorited: boolean
}

export interface WebPage<T> {
  total: number
  pageNum: number
  pageSize: number
  list: T[]
}

export interface WebContentGroup {
  groupId: number
  groupName: string
  itemList: WebContentCard[]
}

export interface WebTeacher {
  id: number
  name: string
  schoolOrg: string
  jobTitle: string
  honorTitle: string
  avatarUrl: string
  story: string
}

export interface WebNews {
  id: number
  categoryCode: string
  categoryName: string
  title: string
  summary: string
  coverUrl: string
  detailType: 'ARTICLE' | 'LINK'
  jumpUrl: string
  htmlBody: string
  publishedAt: number | null
}

export interface WebHome {
  featuredList: WebContentCard[]
  hotList: WebContentCard[]
  resourceGroupList: WebContentGroup[]
  levelGroupList: WebContentGroup[]
  researchList: WebContentCard[]
  schoolList: WebContentCard[]
  teacherList: WebTeacher[]
  newsList: WebNews[]
}

export interface WebProfile {
  id: number
  phoneMask: string
  nickname: string
  avatarCode: number
  nicknamePromptNeeded: boolean
  lingyueBound: boolean
}

export type LingyueLaunchTarget = 'home' | 'agent' | 'chat'

export interface LingyueLaunchRequest {
  authorized?: boolean
  target?: LingyueLaunchTarget
  agentCode?: string
}

export interface LingyueLaunchResult {
  launchUrl: string
  expiresIn: number
  lingyueBound: boolean
}

export interface WebLoginResult {
  token: string
  newUser: boolean
  profile: WebProfile
}

export interface WebSession {
  token: string
  profile: WebProfile
  newUser: boolean
}

export interface WebFilterOption {
  id: string
  name: string
  parentId: string | null
}

export interface WebResourceFilters {
  categoryList: WebFilterOption[]
  secondCategoryList: WebFilterOption[]
  levelList: WebFilterOption[]
  bodyPartList: WebFilterOption[]
  typeList: WebFilterOption[]
}

export interface WebActionResult {
  active: boolean
  count: number
}

export interface WebListQuery {
  category?: string
  keyword?: string
  page: number
  secondCategoryId?: string
  recommendedLevel?: string
  bodyPartTagId?: string
  resourceType?: string
}

export interface WebCategory {
  id: string
  label: { 'zh-CN': string; 'en-US': string }
}

export const RESEARCH_CATEGORIES: readonly WebCategory[] = [
  { id: 'SERIES', label: { 'zh-CN': '教学实践', 'en-US': 'Teaching practice' } },
  { id: 'RESEARCH', label: { 'zh-CN': '教研与专业发展', 'en-US': 'Research and development' } },
  { id: 'TOPICS', label: { 'zh-CN': '赛事与主题活动', 'en-US': 'Events and topics' } },
  { id: 'PRODUCTS', label: { 'zh-CN': '产品教程', 'en-US': 'Product tutorials' } },
]

export const SCHOOL_CATEGORIES: readonly WebCategory[] = [
  { id: 'CURRICULUM', label: { 'zh-CN': '校本课程建设', 'en-US': 'School curriculum' } },
  { id: 'DIGITAL', label: { 'zh-CN': '数字化课堂实践', 'en-US': 'Digital classroom' } },
]

export const WEB_PAGE_SIZE = 12

const CHANNEL_PATHS: Record<WebChannel, string> = {
  RESOURCE: 'resources',
  RESEARCH: 'research',
  SCHOOL: 'schools',
}

export function webContentPath(content: Pick<WebContentCard, 'channel' | 'originId'>): string {
  return `/${CHANNEL_PATHS[content.channel]}/${content.originId}`
}

export function formatPublishedAt(value: number | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}
