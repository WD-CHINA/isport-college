import type {
  WebActionResult,
  WebContentCard,
  WebContentDetail,
  WebHome,
  WebNews,
  WebPage,
  WebResourceFilters,
  WebTeacher,
} from '@isport/shared'
import { ApiError } from '~/api/errors'

function invalid(): never {
  throw ApiError.serviceUnavailable('学苑接口数据格式不正确')
}
function row(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid()
  return value as Record<string, unknown>
}
function list<T>(value: unknown, parse: (value: unknown) => T): T[] {
  if (!Array.isArray(value)) return invalid()
  return value.map(parse)
}
function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}
function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return invalid()
  return value
}
function id(value: unknown) {
  const parsed = number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : invalid()
}
function choice<T extends string>(value: unknown, choices: readonly T[]): T {
  return choices.find(item => item === value) ?? invalid()
}
export function parseContentCard(value: unknown): WebContentCard {
  const item = row(value)
  if (typeof item.title !== 'string' || typeof item.contentKey !== 'string') return invalid()
  return {
    channel: choice(item.channel, ['RESOURCE', 'RESEARCH', 'SCHOOL']),
    origin: choice(item.origin, ['PLATFORM', 'ACADEMY']),
    originId: id(item.originId),
    contentKey: item.contentKey,
    title: item.title,
    summary: text(item.summary),
    coverUrl: text(item.coverUrl),
    detailType: choice(item.detailType, ['ARTICLE', 'LINK', 'VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE']),
    categoryCode: text(item.categoryCode),
    categoryName: text(item.categoryName),
    authorName: text(item.authorName),
    provinceName: text(item.provinceName),
    schoolName: text(item.schoolName),
    viewCount: number(item.viewCount),
    likeCount: number(item.likeCount),
    favoriteCount: number(item.favoriteCount),
    interactive: item.interactive !== false,
    publishedAt: item.publishedAt == null ? null : number(item.publishedAt),
  }
}
export function parseContentDetail(value: unknown): WebContentDetail {
  const item = row(value)
  return {
    ...parseContentCard(item),
    description: text(item.description),
    htmlBody: text(item.htmlBody),
    jumpUrl: text(item.jumpUrl),
    resourceType: item.resourceType == null ? null : number(item.resourceType),
    liked: item.liked === true,
    favorited: item.favorited === true,
    mediaList: list(item.mediaList ?? [], value => {
      const media = row(value)
      if (typeof media.fileUrl !== 'string') return invalid()
      return {
        mediaType: choice(media.mediaType, ['VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE']),
        fileUrl: media.fileUrl,
        coverUrl: text(media.coverUrl),
        durationSec: media.durationSec == null ? null : number(media.durationSec),
        pageCount: media.pageCount == null ? null : number(media.pageCount),
      }
    }),
  }
}
export function parsePage<T>(value: unknown, parse: (value: unknown) => T): WebPage<T> {
  const page = row(value)
  const total = number(page.total)
  if (!Number.isSafeInteger(total)) return invalid()
  return {
    total,
    pageNum: id(page.pageNum),
    pageSize: id(page.pageSize),
    list: list(page.list, parse),
  }
}
export function parseTeacher(value: unknown): WebTeacher {
  const item = row(value)
  if (typeof item.name !== 'string') return invalid()
  return {
    id: id(item.id),
    name: item.name,
    schoolOrg: text(item.schoolOrg),
    jobTitle: text(item.jobTitle),
    honorTitle: text(item.honorTitle),
    avatarUrl: text(item.avatarUrl),
    story: text(item.story),
  }
}
export function parseNews(value: unknown): WebNews {
  const item = row(value)
  if (typeof item.title !== 'string') return invalid()
  return {
    id: id(item.id),
    title: item.title,
    categoryCode: text(item.categoryCode),
    categoryName: text(item.categoryName),
    summary: text(item.summary),
    coverUrl: text(item.coverUrl),
    detailType: choice(item.detailType, ['ARTICLE', 'LINK']),
    jumpUrl: text(item.jumpUrl),
    htmlBody: text(item.htmlBody),
    publishedAt: item.publishedAt == null ? null : number(item.publishedAt),
  }
}
export function parseHome(value: unknown): WebHome {
  const home = row(value)
  const cards = (value: unknown) => list(value, parseContentCard)
  const groups = (value: unknown) =>
    list(value, value => {
      const group = row(value)
      return {
        groupId: id(group.groupId),
        groupName: text(group.groupName),
        itemList: cards(group.itemList),
      }
    })
  return {
    featuredList: cards(home.featuredList),
    hotList: cards(home.hotList),
    resourceGroupList: groups(home.resourceGroupList),
    levelGroupList: groups(home.levelGroupList),
    researchList: cards(home.researchList),
    schoolList: cards(home.schoolList),
    teacherList: list(home.teacherList, parseTeacher),
    newsList: list(home.newsList, parseNews),
  }
}
export function parseFilters(value: unknown): WebResourceFilters {
  const filters = row(value)
  const options = (value: unknown) =>
    list(value, value => {
      const item = row(value)
      if (
        typeof item.id !== 'string' ||
        typeof item.name !== 'string' ||
        (item.parentId !== null && typeof item.parentId !== 'string')
      )
        return invalid()
      return { id: item.id, name: item.name, parentId: item.parentId }
    })
  return {
    categoryList: options(filters.categoryList),
    secondCategoryList: options(filters.secondCategoryList),
    levelList: options(filters.levelList),
    bodyPartList: options(filters.bodyPartList),
    typeList: options(filters.typeList),
  }
}
export function parseAction(value: unknown): WebActionResult {
  const item = row(value)
  if (typeof item.active !== 'boolean') return invalid()
  return { active: item.active, count: number(item.count) }
}
export const parseCards = (value: unknown) => list(value, parseContentCard)
export const parseAvatars = (value: unknown) => list(value, id)
