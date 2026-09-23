import {
  CONTENT_CHANNELS,
  MEDIA_KINDS,
  safeExternalUrl,
  type AcademyContent,
  type Taxonomy,
} from '@isport/shared'
import { ApiError } from '../errors'
import {
  choice,
  flag,
  nextId,
  numeric,
  object,
  once,
  page,
  requireP1,
  requireUser,
  text,
  type MockContext,
} from './context'
import { newest } from './content'

function localized(value: unknown, max: number) {
  const input = object(value)
  return { 'zh-CN': text(input, 'zh-CN', max, true), 'en-US': text(input, 'en-US', max, true) }
}

function audit(ctx: MockContext, action: string, targetId: string, reason = '') {
  ctx.state.audits.push({
    id: nextId(ctx, 'audit'),
    actorId: requireUser(ctx).id,
    action,
    targetId,
    reason,
    createdAt: ctx.now,
  })
}

function findContent(ctx: MockContext, id: string) {
  const item = ctx.state.contents.find(row => row.id === id && row.status !== 'deleted')
  if (!item) throw ApiError.notFound()
  return item
}

function offline(ctx: MockContext, id: string, reason: string) {
  const item = findContent(ctx, id)
  item.status = 'offline'
  item.version++
  const work = ctx.state.works.find(row => row.contentId === id)
  if (work) work.offline = true
  audit(ctx, 'content.offline', id, reason)
  return item
}

function editableContent(ctx: MockContext, input: Record<string, unknown>): AcademyContent {
  const raw = object(input.content)
  const id = text(raw, 'id', 100, true) || nextId(ctx, 'content')
  const existing =
    ctx.state.workingCopies.find(item => item.id === id) ??
    ctx.state.contents.find(item => item.id === id)
  if (existing && existing.version !== numeric(input, 'version'))
    throw ApiError.validation('内容已更新，请刷新')
  const media = object(raw.media)
  const kind = choice(media, 'kind', MEDIA_KINDS)
  const url = text(media, 'url', 2000, true)
  if (kind === 'link' && !safeExternalUrl(url)) throw ApiError.validation('外链需要 HTTPS 地址')
  if (kind !== 'link' && url && !/^\/(?:media\/|api\/academy\/files\/)[a-zA-Z0-9_.-]+$/.test(url))
    throw ApiError.validation('请使用本站媒体文件')
  const cover = text(raw, 'cover', 500, true)
  if (cover && !/^\/(?:media\/|api\/academy\/files\/)[a-zA-Z0-9_.-]+$/.test(cover))
    throw ApiError.validation('请使用本站封面')
  return {
    id,
    channel: choice(raw, 'channel', CONTENT_CHANNELS),
    category: text(raw, 'category', 100, true),
    title: localized(raw.title, 80),
    summary: localized(raw.summary, 1000),
    body: localized(raw.body, 100000),
    cover,
    author: text(raw, 'author', 100, true),
    media: {
      kind,
      url,
      fileId: text(media, 'fileId', 100, true) || undefined,
      filename: text(media, 'filename', 200, true) || undefined,
    },
    level: raw.level === undefined ? undefined : numeric(raw, 'level'),
    province: text(raw, 'province', 100, true),
    school: text(raw, 'school', 100, true),
    status: existing?.status ?? 'draft',
    views: existing?.views ?? 0,
    publishedAt: existing?.publishedAt ?? '',
    sourceWorkId: existing?.sourceWorkId,
    version: (existing?.version ?? 0) + 1,
  }
}

export function handleOperations(
  ctx: MockContext,
  operation: string,
  input: Record<string, unknown>,
): unknown {
  if (operation === 'tracking/event') {
    requireP1(ctx)
    const id = text(input, 'eventId', 128)
    const name = choice(input, 'name', [
      'page',
      'search',
      'filter',
      'detail',
      'login',
      'interaction',
      'submit',
      'review',
      'exchange',
    ] as const)
    const contentId = text(input, 'contentId', 100, true)
    if (contentId && !ctx.state.contents.some(item => item.id === contentId))
      throw ApiError.validation('内容不存在')
    const result =
      input.result === undefined
        ? undefined
        : choice(input, 'result', ['success', 'failure', 'cancelled'] as const)
    if (!ctx.state.events.some(item => item.id === id))
      ctx.state.events.push({
        id,
        name,
        contentId: contentId || undefined,
        result,
        createdAt: ctx.now,
      })
    return { ok: true }
  }
  if (!operation.startsWith('admin/')) return undefined
  requireP1(ctx)
  requireUser(ctx, 'operator')
  const { state } = ctx
  if (operation === 'admin/content/list') {
    const keyword = text(input, 'keyword', 100, true).toLowerCase()
    return page(
      state.contents
        .filter(
          item =>
            item.status !== 'deleted' &&
            (!keyword ||
              Object.values(item.title).some(value => value.toLowerCase().includes(keyword))),
        )
        .sort(newest),
      input,
    )
  }
  if (operation === 'admin/content/detail') {
    const id = text(input, 'id')
    return state.workingCopies.find(item => item.id === id) ?? findContent(ctx, id)
  }
  if (operation === 'admin/content/save') {
    const item = editableContent(ctx, input)
    state.workingCopies = state.workingCopies.filter(row => row.id !== item.id)
    state.workingCopies.push(item)
    if (!state.contents.some(row => row.id === item.id))
      state.contents.push({ ...item, status: 'draft' })
    audit(ctx, 'content.save', item.id)
    return item
  }
  if (operation === 'admin/content/publish') {
    return once(ctx, operation, input, () => {
      const id = text(input, 'id')
      const original = findContent(ctx, id)
      const item = state.workingCopies.find(row => row.id === id) ?? original
      if (item.version !== numeric(input, 'version'))
        throw ApiError.validation('内容已更新，请刷新')
      if (
        !item.title['zh-CN'] ||
        !item.cover ||
        !state.taxonomies.some(
          row => row.id === item.category && row.channel === item.channel && row.enabled,
        )
      )
        throw ApiError.validation('标题、封面和有效分类为必填项')
      if (item.media.kind === 'article' && !item.body['zh-CN'].replace(/<[^>]*>/g, '').trim())
        throw ApiError.validation('请填写正文')
      if (!['article', 'ppt'].includes(item.media.kind) && !item.media.url)
        throw ApiError.validation('缺少内容地址')
      if (item.channel === 'school' && (!item.province || !item.school))
        throw ApiError.validation('学校案例需补充省份和学校')
      const published = {
        ...item,
        views: original.views,
        status: 'published' as const,
        publishedAt: ctx.now,
        version: item.version + 1,
      }
      state.contents[state.contents.indexOf(original)] = published
      state.workingCopies = state.workingCopies.filter(row => row.id !== id)
      const work = state.works.find(row => row.contentId === id)
      if (work) work.offline = false
      audit(ctx, 'content.publish', id)
      return published
    })
  }
  if (operation === 'admin/content/offline')
    return offline(ctx, text(input, 'id'), text(input, 'reason', 1000))
  if (operation === 'admin/taxonomies') return state.taxonomies
  if (operation === 'admin/taxonomy/save') {
    const id = text(input, 'id', 100)
    if (!/^[a-z][a-z0-9-]*$/.test(id))
      throw ApiError.validation('分类编码只能使用小写字母、数字和连字符')
    const item: Taxonomy = {
      id,
      channel: choice(input, 'channel', CONTENT_CHANNELS),
      label: localized(input.label, 50),
      enabled: flag(input, 'enabled'),
      order: numeric(input, 'order'),
    }
    if (!item.label['zh-CN'] || !item.label['en-US']) throw ApiError.validation('请填写中英文名称')
    const previous = state.taxonomies.find(row => row.id === id)
    if (
      previous &&
      previous.channel !== item.channel &&
      state.contents.some(row => row.category === id)
    )
      throw ApiError.validation('已使用分类不能更改栏目')
    state.taxonomies = state.taxonomies.filter(row => row.id !== id)
    state.taxonomies.push(item)
    audit(ctx, 'taxonomy.save', id)
    return item
  }
  if (operation === 'admin/taxonomy/delete') {
    const id = text(input, 'id')
    if (
      state.contents.some(item => item.category === id) ||
      state.works.some(item => item.category === id)
    )
      throw ApiError.validation('分类已被引用，不能删除')
    state.taxonomies = state.taxonomies.filter(item => item.id !== id)
    audit(ctx, 'taxonomy.delete', id)
    return { ok: true }
  }
  if (operation === 'admin/slots') return state.slots
  if (operation === 'admin/slots/save') {
    for (const key of ['featured', 'popular', 'coCreated'] as const) {
      const ids = input[key]
      if (
        Array.isArray(ids) &&
        ids.length <= 20 &&
        ids.every(
          id =>
            typeof id === 'string' &&
            state.contents.some(
              item =>
                item.id === id &&
                item.status === 'published' &&
                (key !== 'coCreated' || item.sourceWorkId),
            ),
        )
      )
        state.slots[key] = [...new Set(ids)] as string[]
      else throw ApiError.validation('推荐位只能选择有效已发布内容，共创精选必须来自投稿')
    }
    audit(ctx, 'slots.save', 'home')
    return state.slots
  }
  if (operation === 'admin/reports') return state.reports
  if (operation === 'admin/report/resolve') {
    const report = state.reports.find(item => item.id === text(input, 'id'))
    if (!report) throw ApiError.notFound()
    report.result = text(input, 'result', 1000)
    if (flag(input, 'offline')) offline(ctx, report.contentId, report.result)
    report.status = 'resolved'
    report.operatorId = requireUser(ctx).id
    report.updatedAt = ctx.now
    audit(ctx, 'report.resolve', report.id, report.result)
    return report
  }
  return undefined
}
