import type {
  LingyueLaunchRequest,
  WebActionResult,
  WebChannel,
  WebContentCard,
  WebContentDetail,
  WebHome,
  WebLoginResult,
  WebNews,
  WebPage,
  WebProfile,
  WebResourceFilters,
  WebTeacher,
} from '@isport/shared'

import type { ApiRequest } from './request'

const CONTENT_PATH: Record<WebChannel, string> = {
  RESOURCE: '/resources',
  RESEARCH: '/research',
  SCHOOL: '/schools',
}

/** 学苑前台接口。只声明路径、方法和参数，响应原样返回。 */
export function createAcademyClient(request: ApiRequest) {
  return {
    sendSms(params: { phone: string }) {
      return request('POST', '/auth/sms', { body: params, responseMode: 'void' })
    },
    login(params: { phone: string; code: string; agreed: boolean }) {
      return request('POST', '/auth/login', { body: params }) as Promise<WebLoginResult>
    },
    logout() {
      return request('POST', '/auth/logout', { responseMode: 'void' })
    },
    me(params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/me', { query: params, signal }) as Promise<WebProfile>
    },
    launchLingyue(body: LingyueLaunchRequest) {
      return request('POST', '/me/lingyue/launch', { body })
    },
    updateNickname(params: { nickname: string }) {
      return request('PUT', '/me/nickname', { body: params }) as Promise<WebProfile>
    },
    dismissNicknamePrompt() {
      return request('POST', '/me/nickname-prompt', { responseMode: 'void' })
    },
    home(params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/home', { query: params, signal }) as Promise<WebHome>
    },
    resourceFilters(params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/resources/filters', {
        query: params,
        signal,
      }) as Promise<WebResourceFilters>
    },
    resources(params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/resources', { query: params, signal }) as Promise<
        WebPage<WebContentCard>
      >
    },
    research(params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/research', { query: params, signal }) as Promise<
        WebPage<WebContentCard>
      >
    },
    schools(params?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/schools', { query: params, signal }) as Promise<
        WebPage<WebContentCard>
      >
    },
    content(channel: WebChannel, originId: number, signal?: AbortSignal) {
      return request('GET', `${CONTENT_PATH[channel]}/${originId}`, {
        signal,
      }) as Promise<WebContentDetail>
    },
    recommend(query?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/contents/recommend', { query, signal }) as Promise<WebContentCard[]>
    },
    view(body: Pick<WebContentCard, 'channel' | 'origin' | 'originId'>) {
      return request('POST', '/contents/view', { body, responseMode: 'void' })
    },
    like(body: Pick<WebContentCard, 'channel' | 'origin' | 'originId'>) {
      return request('POST', '/actions/like', { body }) as Promise<WebActionResult>
    },
    favorite(body: Pick<WebContentCard, 'channel' | 'origin' | 'originId'>) {
      return request('POST', '/actions/favorite', { body }) as Promise<WebActionResult>
    },
    actions(query?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/me/actions', { query, signal }) as Promise<WebPage<WebContentCard>>
    },
    teachers(query?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/teachers', { query, signal }) as Promise<WebPage<WebTeacher>>
    },
    teacher(id: number, signal?: AbortSignal) {
      return request('GET', `/teachers/${id}`, { signal }) as Promise<WebTeacher>
    },
    news(query?: Record<string, string | number | undefined>, signal?: AbortSignal) {
      return request('GET', '/news', { query, signal }) as Promise<WebPage<WebNews>>
    },
    newsDetail(id: number, signal?: AbortSignal) {
      return request('GET', `/news/${id}`, { signal }) as Promise<WebNews>
    },
  }
}

export type AcademyClient = ReturnType<typeof createAcademyClient>
