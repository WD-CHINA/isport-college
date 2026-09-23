import type { LocalizedText, User } from './entities'
import type { PageQuery } from './types'

export type ProductPhase = 'p0' | 'p1'
export type DataSource = 'mock' | 'http'
export type ContentChannel = 'resource' | 'research' | 'school'
export type MediaKind = 'video' | 'audio' | 'image' | 'pdf' | 'ppt' | 'article' | 'link'
export type ContentStatus = 'draft' | 'published' | 'offline' | 'deleted'
export type InteractionKind = 'like' | 'favorite'
export type SubmissionKind = 'demonstration' | 'courseware' | 'micro' | 'lesson' | 'practice'
export type WorkStatus = 'draft' | 'pending' | 'published' | 'rejected'
export type ReviewResult = 'approved' | 'rejected'

export interface TeacherProfile {
  realName: string
  province: string
  city: string
  district: string
  school: string
  teacherRole: string
  stage: string
  subject: string
}

export interface AcademyUser extends User {
  avatar: string
  nicknamePrompted: boolean
  createdAt: string
  teacher?: TeacherProfile
}

export interface Taxonomy {
  id: string
  channel: ContentChannel
  label: LocalizedText
  enabled: boolean
  order: number
}

export interface MediaAsset {
  kind: MediaKind
  url: string
  fileId?: string
  filename?: string
  mime?: string
  size?: number
  duration?: number
}

export interface AcademyContent {
  id: string
  channel: ContentChannel
  category: string
  title: LocalizedText
  summary: LocalizedText
  cover: string
  author: string
  media: MediaAsset
  body: LocalizedText
  level?: number
  fitness?: string
  bodyPart?: string
  music?: boolean
  province?: string
  school?: string
  status: ContentStatus
  publishedAt: string
  views: number
  sourceWorkId?: string
  version: number
}

export interface ContentQuery extends PageQuery {
  channel?: ContentChannel
  category?: string
  keyword?: string
  level?: number
  kind?: MediaKind | 'courseware'
  fitness?: string
  bodyPart?: string
}

export interface ContentStats {
  views: number
  likes: number
  favorites: number
  liked: boolean
  favorited: boolean
}

export interface ContentDetail {
  categoryLabel: LocalizedText
  content: AcademyContent
  stats: ContentStats
  recommendations: AcademyContent[]
}

export interface Interaction {
  userId: string
  contentId: string
  kind: InteractionKind
  createdAt: string
}

export interface ActivityItem {
  content: AcademyContent
  createdAt: string
}

export interface WorkFields {
  kind: SubmissionKind
  title: string
  summary: string
  cover: string
  category: string
  tags: string[]
  level?: number
  stage: string
  mode: 'file' | 'article' | 'link'
  fileId?: string
  body: string
  url: string
  copyright: boolean
  privacy: boolean
}

export interface Work extends WorkFields {
  id: string
  userId: string
  status: WorkStatus
  version: number
  createdAt: string
  updatedAt: string
  submittedAt?: string
  contentId?: string
  offline?: boolean
  precheck: 'pending' | 'clear' | 'duplicate' | 'privacy' | 'unsafe' | 'failed'
}

export interface ReviewRecord {
  id: string
  workId: string
  reviewerId: string
  result: ReviewResult
  reason: string
  createdAt: string
  version: number
}

export interface UploadedFile {
  id: string
  userId: string
  name: string
  mime: string
  size: number
  kind: MediaKind
  createdAt: string
}

export interface PointBatch {
  id: string
  userId: string
  source: string
  amount: number
  remaining: number
  expiresAt: string
  createdAt: string
}

export interface PointEntry {
  id: string
  userId: string
  kind: 'reward' | 'freeze' | 'spend' | 'release' | 'expire'
  amount: number
  source: string
  createdAt: string
}

export interface ExchangeOrder {
  id: string
  userId: string
  amount: number
  status: 'pending' | 'succeeded' | 'failed'
  allocations: Array<{ batchId: string; amount: number }>
  createdAt: string
  updatedAt: string
}

export interface PointAccount {
  available: number
  frozen: number
  entries: PointEntry[]
  batches: PointBatch[]
  orders: ExchangeOrder[]
}

export interface LingyueAccount {
  userId: string
  externalId: string
  linked: boolean
}

export interface LingyueResult {
  status: 'authorization_required' | 'linked'
  simulated: true
}

export interface RecommendationSlots {
  featured: string[]
  popular: string[]
  coCreated: string[]
}

export interface ContentReport {
  id: string
  contentId: string
  reason: string
  status: 'pending' | 'resolved'
  result: string
  operatorId?: string
  updatedAt: string
}

export interface AuditEvent {
  id: string
  actorId: string
  action: string
  targetId: string
  reason: string
  createdAt: string
}

export interface TrackingEvent {
  id: string
  name: string
  contentId?: string
  result?: string
  createdAt: string
}

export const CONTENT_CHANNELS: readonly ContentChannel[] = ['resource', 'research', 'school']
export const MEDIA_KINDS: readonly MediaKind[] = [
  'video',
  'audio',
  'image',
  'pdf',
  'ppt',
  'article',
  'link',
]
export const SUBMISSION_KINDS: readonly SubmissionKind[] = [
  'demonstration',
  'courseware',
  'micro',
  'lesson',
  'practice',
]
export const AVATAR_IDS = [
  'ball',
  'runner',
  'swimmer',
  'cyclist',
  'racket',
  'star',
  'mountain',
  'sun',
] as const
export const FITNESS_CATEGORIES = [
  'strength',
  'endurance',
  'cardio',
  'power',
  'coordination',
  'flexibility',
  'balance',
  'reaction',
  'agility',
] as const
export const BODY_PARTS = ['upper', 'lower', 'core', 'back', 'whole'] as const

export function normalizeNickname(value: string): string | null {
  const nickname = value.trim()
  return nickname === '' || /^[\u4e00-\u9fffA-Za-z0-9]{2,6}$/.test(nickname) ? nickname : null
}

export function contentPath(content: Pick<AcademyContent, 'id' | 'channel'>): string {
  const paths: Record<ContentChannel, string> = {
    resource: 'resources',
    research: 'research',
    school: 'schools',
  }
  return `/${paths[content.channel]}/${encodeURIComponent(content.id)}`
}

/** 仅接受显式 HTTPS 地址；完整 URL 解析与可达性由适配层处理。 */
export function safeExternalUrl(value: string): boolean {
  return /^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\s\\]*)?$/i.test(
    value,
  )
}
