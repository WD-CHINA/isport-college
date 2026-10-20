import type { AcademyClient } from '~/api/academy'
import { ApiError } from '~/api/errors'
import {
  parseAction,
  parseAvatars,
  parseCards,
  parseContentCard,
  parseContentDetail,
  parseFilters,
  parseHome,
  parseNews,
  parsePage,
  parseTeacher,
} from './web-response'

function decode<Args extends unknown[], Result>(
  request: (...args: Args) => Promise<unknown>,
  parse: (value: unknown) => Result,
) {
  return async (...args: Args) => parse(await request(...args))
}

/** 兼容内容接口以 400 表示下架的旧协议，不影响登录、筛选等接口。 */
function withContentErrors<Args extends unknown[], Result>(
  request: (...args: Args) => Promise<Result>,
) {
  return async (...args: Args) => {
    try {
      return await request(...args)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === 'VALIDATION_FAILED' &&
        /不存在|已下架|not found/i.test(error.message)
      ) {
        throw ApiError.notFound(error.message)
      }
      throw error
    }
  }
}

/** 调用侧响应适配；API 模块保持路径与参数职责。 */
export function createAcademyDataClient(client: AcademyClient) {
  const contentPage = (value: unknown) => parsePage(value, parseContentCard)
  return {
    ...client,
    avatars: decode(client.avatars, parseAvatars),
    home: decode(client.home, parseHome),
    resourceFilters: decode(client.resourceFilters, parseFilters),
    resources: decode(client.resources, contentPage),
    research: decode(client.research, contentPage),
    schools: decode(client.schools, contentPage),
    content: withContentErrors(decode(client.content, parseContentDetail)),
    recommend: decode(client.recommend, parseCards),
    view: withContentErrors(client.view),
    like: withContentErrors(decode(client.like, parseAction)),
    favorite: withContentErrors(decode(client.favorite, parseAction)),
    actions: decode(client.actions, contentPage),
    teachers: decode(client.teachers, value => parsePage(value, parseTeacher)),
    teacher: withContentErrors(decode(client.teacher, parseTeacher)),
    news: decode(client.news, value => parsePage(value, parseNews)),
    newsDetail: withContentErrors(decode(client.newsDetail, parseNews)),
  }
}
