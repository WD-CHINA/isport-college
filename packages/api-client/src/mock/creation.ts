import { MOCK_RULES } from '@isport/mock-data'
import {
  CONTENT_CHANNELS,
  SUBMISSION_KINDS,
  safeExternalUrl,
  type AcademyContent,
  type Work,
  type WorkFields,
} from '@isport/shared'
import { ApiError } from '../errors'
import {
  choice,
  flag,
  nextId,
  numeric,
  once,
  page,
  requireP1,
  requireUser,
  text,
  type MockContext,
} from './context'
import { reward } from './points'

export function ownedWork(ctx: MockContext, id: string, review = false): Work {
  const user = requireUser(ctx, review ? 'reviewer' : undefined)
  const work = ctx.state.works.find(item => item.id === id && (review || item.userId === user.id))
  if (!work) throw ApiError.notFound('作品不存在')
  return work
}

function fields(input: Record<string, unknown>): WorkFields {
  const tags = input.tags
  if (
    !Array.isArray(tags) ||
    tags.length > 5 ||
    tags.some(value => typeof value !== 'string' || value.length > 20)
  )
    throw ApiError.validation('标签最多 5 个，每个最多 20 字')
  const level = input.level === undefined ? undefined : numeric(input, 'level')
  if (level !== undefined && (level < 1 || level > 5))
    throw ApiError.validation('推荐水平应为 1～5')
  return {
    kind: choice(input, 'kind', SUBMISSION_KINDS),
    title: text(input, 'title', 80, true),
    summary: text(input, 'summary', 1000, true),
    cover: text(input, 'cover', 500, true),
    category: text(input, 'category', 100, true),
    tags: tags as string[],
    level,
    stage: text(input, 'stage', 100, true),
    mode: choice(input, 'mode', ['file', 'article', 'link'] as const),
    fileId: text(input, 'fileId', 100, true) || undefined,
    body: text(input, 'body', 100000, true),
    url: text(input, 'url', 2000, true),
    copyright: flag(input, 'copyright'),
    privacy: flag(input, 'privacy'),
  }
}

function validateSubmission(ctx: MockContext, work: Work) {
  if (!work.title || !work.cover || !work.category || !work.copyright || !work.privacy)
    throw ApiError.validation('请完善必填项并确认版权与隐私声明')
  if (!ctx.state.taxonomies.some(item => item.id === work.category && item.enabled))
    throw ApiError.validation('分类不可用')
  if (work.kind !== 'practice' && work.mode !== 'file')
    throw ApiError.validation('当前投稿类型需要上传文件')
  if (work.kind === 'practice' && work.mode === 'file')
    throw ApiError.validation('实践案例请选择图文或链接模式')
  if (work.kind === 'demonstration' || work.kind === 'courseware') {
    if (!work.level) throw ApiError.validation('请选择推荐水平')
  }
  if (work.mode === 'article' && !work.body.replace(/<[^>]*>/g, '').trim())
    throw ApiError.validation('请填写正文')
  if (work.mode === 'link' && !safeExternalUrl(work.url))
    throw ApiError.validation('请输入有效的 HTTPS 链接')
  if (work.mode === 'file') {
    const file = ctx.state.files.find(
      item => item.id === work.fileId && item.userId === work.userId,
    )
    const expected = work.kind === 'courseware' ? ['pdf', 'ppt'] : ['video']
    if (!file || !expected.includes(file.kind)) throw ApiError.validation('请上传对应类型的文件')
  }
  if (work.cover !== '/media/sample.png') {
    const coverId = /^\/api\/academy\/files\/([a-zA-Z0-9-]+)$/.exec(work.cover)?.[1]
    if (
      !ctx.state.files.some(
        item => item.id === coverId && item.userId === work.userId && item.kind === 'image',
      )
    )
      throw ApiError.validation('请使用本人上传的封面')
  }
}

function publish(ctx: MockContext, work: Work, input: Record<string, unknown>): AcademyContent {
  const author = ctx.state.users.find(item => item.id === work.userId)!
  const resource = work.kind === 'demonstration' || work.kind === 'courseware'
  const channel = input.channel
    ? choice(input, 'channel', CONTENT_CHANNELS)
    : resource
      ? 'resource'
      : 'research'
  const category = text(input, 'category', 100, true) || work.category
  if (
    !ctx.state.taxonomies.some(
      item => item.id === category && item.channel === channel && item.enabled,
    )
  )
    throw ApiError.validation('发布栏目与分类不匹配')
  if (channel === 'school' && work.kind !== 'practice')
    throw ApiError.validation('学校案例仅接收实践案例')
  const province = channel === 'school' ? text(input, 'province', 100) : undefined
  const school = channel === 'school' ? text(input, 'school', 100) : undefined
  const file = ctx.state.files.find(item => item.id === work.fileId)
  const content: AcademyContent = {
    id: work.contentId ?? nextId(ctx, 'content'),
    channel,
    category,
    title: { 'zh-CN': work.title, 'en-US': work.title },
    summary: { 'zh-CN': work.summary, 'en-US': work.summary },
    body: { 'zh-CN': work.body, 'en-US': work.body },
    cover: work.cover,
    author: author.name || '匿名教师',
    media:
      work.mode === 'file' && file
        ? {
            kind: file.kind,
            url: `/api/academy/files/${file.id}`,
            fileId: file.id,
            filename: file.name,
            mime: file.mime,
            size: file.size,
          }
        : { kind: work.mode === 'link' ? 'link' : 'article', url: work.url },
    level: work.level,
    province,
    school,
    status: 'published',
    publishedAt: ctx.now,
    views: 0,
    version: 1,
    sourceWorkId: work.id,
  }
  const existing = ctx.state.contents.findIndex(item => item.id === content.id)
  if (existing >= 0) throw ApiError.validation('作品已发布')
  ctx.state.contents.push(content)
  work.contentId = content.id
  reward(ctx, work.userId, `work:${work.id}`, MOCK_RULES.reward[work.kind])
  return content
}

export function handleCreation(
  ctx: MockContext,
  operation: string,
  input: Record<string, unknown>,
): unknown {
  if (!operation.startsWith('work/') && !operation.startsWith('review/')) return undefined
  requireP1(ctx)
  const reviewing = operation.startsWith('review/')
  const user = requireUser(ctx, reviewing ? 'reviewer' : undefined)
  if (operation === 'work/list' || operation === 'review/list') {
    const keyword = text(input, 'keyword', 100, true).toLowerCase()
    const author = text(input, 'author', 100, true).toLowerCase()
    const rows = ctx.state.works
      .filter(item => (reviewing ? item.status !== 'draft' : item.userId === user.id))
      .map(item => {
        const owner = ctx.state.users.find(row => row.id === item.userId)!
        return { ...item, author: owner.name, school: owner.teacher?.school ?? '' }
      })
      .filter(
        item =>
          (!input.status ||
            (input.status === 'reviewed'
              ? ['published', 'rejected'].includes(item.status)
              : item.status === input.status)) &&
          (!input.kind || item.kind === input.kind) &&
          (!input.category || item.category === input.category) &&
          (!keyword || `${item.title} ${item.id}`.toLowerCase().includes(keyword)) &&
          (!author || `${item.author} ${item.school}`.toLowerCase().includes(author)) &&
          (!input.result ||
            ctx.state.reviews.filter(row => row.workId === item.id).at(-1)?.result ===
              input.result),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id))
    return page(rows, input)
  }
  if (operation === 'work/save') {
    const data = fields(input)
    const id = text(input, 'id', 100, true)
    if (id) {
      const work = ownedWork(ctx, id)
      if (!['draft', 'rejected'].includes(work.status))
        throw ApiError.validation('当前作品不可编辑')
      if (work.version !== numeric(input, 'version'))
        throw ApiError.validation('作品已更新，请重新打开')
      Object.assign(work, data, { updatedAt: ctx.now, version: work.version + 1 })
      return work
    }
    const work: Work = {
      ...data,
      id: nextId(ctx, 'work'),
      userId: user.id,
      status: 'draft',
      version: 1,
      createdAt: ctx.now,
      updatedAt: ctx.now,
      precheck: 'pending',
    }
    ctx.state.works.push(work)
    return work
  }
  if (operation === 'work/detail' || operation === 'review/detail') {
    const work = ownedWork(ctx, text(input, 'id'), reviewing)
    return {
      work,
      reviews: ctx.state.reviews.filter(item => item.workId === work.id),
      files: ctx.state.files.filter(
        item => item.id === work.fileId || work.cover.endsWith(`/${item.id}`),
      ),
    }
  }
  if (operation === 'work/submit' || operation === 'review/decide') {
    return once(ctx, operation, input, () => {
      const work = ownedWork(ctx, text(input, 'id'), reviewing)
      if (work.version !== numeric(input, 'version'))
        throw ApiError.validation('作品状态已变化，请刷新')
      if (!reviewing) {
        if (!['draft', 'rejected'].includes(work.status))
          throw ApiError.validation('作品不可重复提交')
        validateSubmission(ctx, work)
        work.status = 'pending'
        work.submittedAt = ctx.now
        work.precheck = 'clear'
      } else {
        if (work.status !== 'pending') throw ApiError.validation('作品已被处理')
        const approved = flag(input, 'approved')
        const reason = text(input, 'reason', 1000, approved)
        if (approved) {
          validateSubmission(ctx, work)
          publish(ctx, work, input)
        }
        work.status = approved ? 'published' : 'rejected'
        ctx.state.reviews.push({
          id: nextId(ctx, 'review'),
          workId: work.id,
          reviewerId: user.id,
          result: approved ? 'approved' : 'rejected',
          reason,
          createdAt: ctx.now,
          version: work.version,
        })
      }
      work.version++
      work.updatedAt = ctx.now
      return work
    })
  }
  return undefined
}
