import type {
  AcademyContent,
  AcademyUser,
  ActivityItem,
  AuthSession,
  ContentChannel,
  ContentDetail,
  ContentQuery,
  ContentReport,
  ContentStats,
  InteractionKind,
  LingyueResult,
  PageQuery,
  PageResult,
  PointAccount,
  ExchangeOrder,
  RecommendationSlots,
  ReviewRecord,
  Taxonomy,
  TeacherProfile,
  UploadedFile,
  Work,
  WorkFields,
} from '@isport/shared'
import type { createHttpClient } from './http/client'

type Operation<I, O> = { input: I; output: O }
type Empty = Record<string, never>
export type AcademySession = AuthSession & {
  user: AcademyUser
  isNew: boolean
  promptNickname: boolean
}
export interface WorkDetail {
  work: Work
  reviews: ReviewRecord[]
  files: UploadedFile[]
}

export interface AcademyOperations {
  'auth/challenge': Operation<
    { phone: string },
    { id: string; retryAfter: number; demoCode: string }
  >
  'auth/login': Operation<
    { phone: string; challengeId: string; code: string; agreed: boolean },
    AcademySession
  >
  'auth/logout': Operation<Empty, { ok: true }>
  'account/me': Operation<Empty, AcademyUser>
  'account/profile': Operation<{ nickname: string; avatar: string }, AcademyUser>
  'account/teacher': Operation<TeacherProfile, AcademyUser>
  'content/list': Operation<ContentQuery, PageResult<AcademyContent>>
  'content/detail': Operation<{ id: string }, ContentDetail>
  'content/view': Operation<{ id: string; eventId: string }, ContentStats>
  'content/taxonomies': Operation<Empty, Taxonomy[]>
  'content/home': Operation<
    Empty,
    {
      featured: AcademyContent[]
      popular: AcademyContent[]
      coCreated: AcademyContent[]
      taxonomies: Taxonomy[]
      resources: Record<string, AcademyContent[]>
      research: Record<string, AcademyContent[]>
      schools: AcademyContent[]
    }
  >
  'interaction/set': Operation<{ id: string; kind: InteractionKind; active: boolean }, ContentStats>
  'interaction/list': Operation<
    PageQuery & { kind: InteractionKind; channel?: ContentChannel },
    PageResult<ActivityItem> & { totals: { like: number; favorite: number } }
  >
  'lingyue/enter': Operation<{ authorize?: boolean }, LingyueResult>
  'work/list': Operation<PageQuery & { status?: string }, PageResult<Work>>
  'work/detail': Operation<{ id: string }, WorkDetail>
  'work/save': Operation<WorkFields & { id?: string; version?: number }, Work>
  'work/submit': Operation<{ id: string; version: number; requestId: string }, Work>
  'review/list': Operation<
    PageQuery & {
      status?: string
      keyword?: string
      kind?: string
      category?: string
      author?: string
      result?: string
    },
    PageResult<Work & { author: string; school: string }>
  >
  'review/detail': Operation<{ id: string }, WorkDetail>
  'review/decide': Operation<
    {
      id: string
      version: number
      approved: boolean
      reason: string
      requestId: string
      channel?: ContentChannel
      category?: string
      province?: string
      school?: string
    },
    Work
  >
  'points/account': Operation<Empty, PointAccount>
  'points/exchange': Operation<{ amount: number; requestId: string }, ExchangeOrder>
  'points/order': Operation<{ id: string }, ExchangeOrder>
  'admin/content/list': Operation<PageQuery & { keyword?: string }, PageResult<AcademyContent>>
  'admin/content/detail': Operation<{ id: string }, AcademyContent>
  'admin/content/save': Operation<{ content: AcademyContent; version: number }, AcademyContent>
  'admin/content/publish': Operation<
    { id: string; version: number; requestId: string },
    AcademyContent
  >
  'admin/content/offline': Operation<{ id: string; reason: string }, AcademyContent>
  'admin/taxonomies': Operation<Empty, Taxonomy[]>
  'admin/taxonomy/save': Operation<Taxonomy, Taxonomy>
  'admin/taxonomy/delete': Operation<{ id: string }, { ok: true }>
  'admin/slots': Operation<Empty, RecommendationSlots>
  'admin/slots/save': Operation<RecommendationSlots, RecommendationSlots>
  'admin/reports': Operation<Empty, ContentReport[]>
  'admin/report/resolve': Operation<{ id: string; result: string; offline: boolean }, ContentReport>
  'tracking/event': Operation<
    { eventId: string; name: string; contentId?: string; result?: string },
    { ok: true }
  >
}

export interface AcademyRepository {
  call<K extends keyof AcademyOperations>(
    operation: K,
    input: AcademyOperations[K]['input'],
    signal?: AbortSignal,
  ): Promise<AcademyOperations[K]['output']>
}

/** 所有业务调用走同源入口，具体后台协议仅在服务端适配。 */
export function createAcademyRepository(
  http: ReturnType<typeof createHttpClient>,
): AcademyRepository {
  return {
    call<K extends keyof AcademyOperations>(
      operation: K,
      input: AcademyOperations[K]['input'],
      signal?: AbortSignal,
    ) {
      return http<AcademyOperations[K]['output']>(`/api/academy/v1/${operation}`, {
        method: 'POST',
        body: input,
        signal,
        retry: 0,
      })
    },
  }
}
