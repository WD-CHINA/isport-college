import type { AcademyContent, ContentStats } from '@isport/shared'
import { ApiError } from '../errors'
import { choice, currentUser, flag, page, requireUser, text, type MockContext } from './context'

export function publishedContent(ctx: MockContext, id: string): AcademyContent {
  const content = ctx.state.contents.find(item => item.id === id && item.status === 'published')
  if (!content) throw ApiError.notFound('内容已失效或不存在')
  return content
}

export function contentStats(ctx: MockContext, content: AcademyContent): ContentStats {
  const user = currentUser(ctx, false)
  const relations = ctx.state.interactions.filter(item => item.contentId === content.id)
  return {
    views: content.views,
    likes: relations.filter(item => item.kind === 'like').length,
    favorites: relations.filter(item => item.kind === 'favorite').length,
    liked: relations.some(item => item.kind === 'like' && item.userId === user?.id),
    favorited: relations.some(item => item.kind === 'favorite' && item.userId === user?.id),
  }
}

export function newest(a: AcademyContent, b: AcademyContent): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id)
}

export function recommendations(ctx: MockContext, content: AcademyContent): AcademyContent[] {
  const candidates = ctx.state.contents.filter(
    item =>
      item.status === 'published' && item.channel === content.channel && item.id !== content.id,
  )
  const same = candidates
    .filter(item => item.category === content.category)
    .sort((a, b) => b.views - a.views || newest(a, b))
  const other = candidates.filter(item => item.category !== content.category).sort(newest)
  const limit =
    content.channel === 'school' ||
    (content.channel === 'research' && content.media.kind === 'article')
      ? 5
      : 3
  return [...same, ...other].slice(0, 0 + limit)
}

export function handleContent(
  ctx: MockContext,
  operation: string,
  input: Record<string, unknown>,
): unknown {
  const { state } = ctx
  if (operation === 'content/list') {
    const keyword = text(input, 'keyword', 100, true).toLowerCase()
    const rows = state.contents.filter(
      item =>
        item.status === 'published' &&
        (!input.channel || item.channel === input.channel) &&
        (!input.category || item.category === input.category) &&
        (!input.level || item.level === input.level) &&
        (!input.kind ||
          (input.kind === 'courseware'
            ? ['ppt', 'pdf'].includes(item.media.kind)
            : item.media.kind === input.kind)) &&
        (!input.fitness || item.fitness === input.fitness) &&
        (!input.bodyPart || item.bodyPart === input.bodyPart) &&
        (!keyword ||
          Object.values(item.title).some(value => value.toLowerCase().includes(keyword))),
    )
    return page(rows.sort(newest), input)
  }
  if (operation === 'content/taxonomies')
    return state.taxonomies.filter(item => item.enabled).sort((a, b) => a.order - b.order)
  if (operation === 'content/home') {
    const select = (ids: string[]) =>
      [...new Set(ids)].flatMap(id => {
        const item = state.contents.find(row => row.id === id && row.status === 'published')
        return item ? [item] : []
      })
    const taxonomies = state.taxonomies
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
    const visible = state.contents.filter(item => item.status === 'published').sort(newest)
    const groups = (channel: 'resource' | 'research') =>
      Object.fromEntries(
        taxonomies
          .filter(item => item.channel === channel)
          .map(category => [
            category.id,
            visible
              .filter(item => item.channel === channel && item.category === category.id)
              .slice(0, 4),
          ]),
      )
    return {
      taxonomies,
      resources: groups('resource'),
      research: groups('research'),
      schools: visible.filter(item => item.channel === 'school').slice(0, 4),
      featured: select(state.slots.featured),
      popular: select(state.slots.popular),
      coCreated:
        ctx.phase === 'p1' ? select(state.slots.coCreated).filter(item => item.sourceWorkId) : [],
    }
  }
  if (
    operation === 'content/detail' ||
    operation === 'content/view' ||
    operation === 'interaction/set'
  ) {
    const content = publishedContent(ctx, text(input, 'id'))
    if (content.media.kind === 'link') throw ApiError.notFound('外链内容请直接访问原地址')
    if (operation === 'content/detail')
      return {
        categoryLabel: state.taxonomies.find(
          item => item.id === content.category && item.channel === content.channel,
        )?.label ?? { 'zh-CN': content.category, 'en-US': content.category },
        content,
        stats: contentStats(ctx, content),
        recommendations: recommendations(ctx, content),
      }
    if (operation === 'content/view') {
      const id = text(input, 'eventId', 128)
      const previous = state.views.find(item => item.id === id)
      if (previous && previous.contentId !== content.id)
        throw ApiError.validation('浏览事件已用于其他内容')
      if (!previous) {
        state.views.push({ id, contentId: content.id })
        content.views++
      }
    } else {
      const user = requireUser(ctx)
      const kind = choice(input, 'kind', ['like', 'favorite'] as const)
      const active = flag(input, 'active')
      const existing = state.interactions.find(
        item => item.userId === user.id && item.contentId === content.id && item.kind === kind,
      )
      if (active && !existing)
        state.interactions.push({
          userId: user.id,
          contentId: content.id,
          kind,
          createdAt: ctx.now,
        })
      if (!active && existing) state.interactions.splice(state.interactions.indexOf(existing), 1)
    }
    return contentStats(ctx, content)
  }
  if (operation === 'interaction/list') {
    const user = requireUser(ctx)
    const kind = choice(input, 'kind', ['like', 'favorite'] as const)
    const valid = state.interactions.filter(
      item =>
        item.userId === user.id &&
        state.contents.some(
          row =>
            row.id === item.contentId && row.status === 'published' && row.media.kind !== 'link',
        ),
    )
    const rows = valid
      .filter(item => item.kind === kind)
      .map(item => ({ content: publishedContent(ctx, item.contentId), createdAt: item.createdAt }))
      .filter(item => !input.channel || item.content.channel === input.channel)
      .sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || a.content.id.localeCompare(b.content.id),
      )
    return {
      ...page(rows, input),
      totals: {
        like: valid.filter(item => item.kind === 'like').length,
        favorite: valid.filter(item => item.kind === 'favorite').length,
      },
    }
  }
  return undefined
}
