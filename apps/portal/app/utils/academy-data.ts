import type { AcademyClient } from '~/api/academy'
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

/** 调用侧响应适配；API 模块保持路径与参数职责。 */
export function createAcademyDataClient(client: AcademyClient) {
  const contentPage = (value: unknown) => parsePage(value, parseContentCard)
  return {
    ...client,
    home: decode(client.home, parseHome),
    resourceFilters: decode(client.resourceFilters, parseFilters),
    resources: decode(client.resources, contentPage),
    research: decode(client.research, contentPage),
    schools: decode(client.schools, contentPage),
    content: decode(client.content, parseContentDetail),
    recommend: decode(client.recommend, parseCards),
    like: decode(client.like, parseAction),
    favorite: decode(client.favorite, parseAction),
    actions: decode(client.actions, contentPage),
    teachers: decode(client.teachers, value => parsePage(value, parseTeacher)),
    teacher: decode(client.teacher, parseTeacher),
    news: decode(client.news, value => parsePage(value, parseNews)),
    newsDetail: decode(client.newsDetail, parseNews),
    avatars: decode(client.avatars, parseAvatars),
  }
}
