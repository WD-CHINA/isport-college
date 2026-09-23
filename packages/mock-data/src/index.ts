import type {
  AcademyContent,
  AcademyUser,
  AuditEvent,
  ContentReport,
  ExchangeOrder,
  Interaction,
  LingyueAccount,
  PointBatch,
  PointEntry,
  RecommendationSlots,
  ReviewRecord,
  SubmissionKind,
  Taxonomy,
  TrackingEvent,
  UploadedFile,
  Work,
} from '@isport/shared'
import { BODY_PARTS, FITNESS_CATEGORIES } from '@isport/shared'

export const MOCK_RULES = {
  pageSize: 12,
  smsRetrySeconds: 60,
  smsTtlSeconds: 300,
  smsAttempts: 5,
  sessionTtlSeconds: 7 * 86400,
  profileReward: 20,
  reward: {
    demonstration: 10,
    courseware: 20,
    micro: 20,
    lesson: 30,
    practice: 20,
  } satisfies Record<SubmissionKind, number>,
  exchangeTiers: [100, 500],
  pointTtlDays: 365,
  uploadLimits: { video: 100 * 1024 ** 2, courseware: 30 * 1024 ** 2, image: 10 * 1024 ** 2 },
} as const

export interface MockChallenge {
  id: string
  phone: string
  code: string
  createdAt: string
  attempts: number
  consumed: boolean
}

export interface MockSnapshot {
  schemaVersion: 1
  sequence: number
  clock?: string
  users: AcademyUser[]
  sessions: Array<{ token: string; userId: string; issuedAt: string }>
  challenges: MockChallenge[]
  contents: AcademyContent[]
  taxonomies: Taxonomy[]
  interactions: Interaction[]
  views: Array<{ id: string; contentId: string }>
  works: Work[]
  reviews: ReviewRecord[]
  files: UploadedFile[]
  batches: PointBatch[]
  entries: PointEntry[]
  exchanges: ExchangeOrder[]
  exchangeOutcome: 'succeeded' | 'failed' | 'pending'
  lingyue: LingyueAccount[]
  slots: RecommendationSlots
  reports: ContentReport[]
  audits: AuditEvent[]
  events: TrackingEvent[]
  workingCopies: AcademyContent[]
  idempotency: Array<{ key: string; fingerprint: string; result: unknown }>
  faults: Array<{
    operation: string
    kind: 'error' | 'empty' | 'delay' | 'timeout' | 'lost-response'
    remaining: number
    status: number
    delayMs: number
  }>
}

const text = (zh: string, en: string) => ({ 'zh-CN': zh, 'en-US': en })

export function createMockSnapshot(now = '2026-09-22T08:00:00.000Z'): MockSnapshot {
  const users: AcademyUser[] = [
    {
      id: 'teacher',
      phone: '18800000001',
      name: '体育老师',
      roles: ['user'],
      avatar: 'ball',
      nicknamePrompted: true,
      createdAt: now,
    },
    {
      id: 'reviewer',
      phone: '18800000002',
      name: '审核员',
      roles: ['user', 'reviewer'],
      avatar: 'star',
      nicknamePrompted: true,
      createdAt: now,
    },
    {
      id: 'operator',
      phone: '18800000003',
      name: '运营员',
      roles: ['user', 'operator'],
      avatar: 'sun',
      nicknamePrompted: true,
      createdAt: now,
    },
    {
      id: 'admin',
      phone: '18800000004',
      name: '管理员',
      roles: ['user', 'admin'],
      avatar: 'mountain',
      nicknamePrompted: true,
      createdAt: now,
    },
    {
      id: 'teacher-2',
      phone: '18800000005',
      name: '',
      roles: ['user'],
      avatar: 'runner',
      nicknamePrompted: true,
      createdAt: now,
    },
  ]
  const taxonomies: Taxonomy[] = [
    ['fitness', 'resource', '体能', 'Fitness'],
    ['sport', 'resource', '专项技能', 'Sports skills'],
    ['basic', 'resource', '基本技能', 'Fundamental skills'],
    ['health', 'resource', '健康教育', 'Health education'],
    ['practice', 'research', '教学实践', 'Teaching practice'],
    ['development', 'research', '教研与专业发展', 'Professional development'],
    ['events', 'research', '赛事与主题活动', 'Events'],
    ['tutorial', 'research', '产品教程', 'Product tutorials'],
    ['curriculum', 'school', '校本课程建设', 'School curriculum'],
    ['digital', 'school', '数字化课堂实践', 'Digital classroom'],
  ].map(([id, channel, zh, en], order) => ({
    id: id!,
    channel: channel as Taxonomy['channel'],
    label: text(zh!, en!),
    enabled: true,
    order,
  }))
  const contents: AcademyContent[] = []
  const kinds = ['video', 'image', 'audio', 'pdf', 'ppt'] as const
  for (let index = 0; index < 120; index++) {
    const channel =
      index < 30
        ? 'resource'
        : index < 40
          ? 'research'
          : index < 48
            ? 'school'
            : index < 88
              ? 'resource'
              : index < 104
                ? 'research'
                : 'school'
    const categories = taxonomies.filter(item => item.channel === channel)
    const category = categories[index % categories.length]!
    const kind =
      channel === 'resource'
        ? kinds[index % kinds.length]!
        : index % 5 === 0
          ? 'link'
          : channel === 'research' && index % 3 === 0
            ? 'video'
            : 'article'
    const id = String(index + 1)
    const urls: Record<string, string> = {
      video: '/media/sample.webm',
      image: '/media/sample.png',
      audio: '/media/sample.wav',
      pdf: '/media/sample.pdf',
      ppt: '',
      article: '',
      link: 'https://example.org/',
    }
    contents.push({
      id,
      channel,
      category: category.id,
      title: text(
        `${category.label['zh-CN']} · 教学示例 ${index + 1}`,
        `${category.label['en-US']} · Sample ${index + 1}`,
      ),
      summary: text(
        '通过循序渐进的练习与合作活动，让每一位学生体验运动的乐趣。',
        'Progressive practice and cooperative activities help every student enjoy movement.',
      ),
      cover: '/media/sample.png',
      author: '融梦学苑示例编辑组',
      media: { kind, url: urls[kind]!, filename: kind === 'ppt' ? '教学示例.pptx' : undefined },
      body: text(
        '<h2>学习目标</h2><p>发展运动技能，体验团队合作。</p><h2>课堂实践</h2><p>从热身到分组练习，关注安全和个体差异。</p>',
        '<h2>Learning goals</h2><p>Develop movement skills and teamwork.</p><h2>Classroom practice</h2><p>Warm up, then practise in groups with attention to safety and individual needs.</p>',
      ),
      level: (index % 5) + 1,
      fitness: index < 48 ? 'strength' : FITNESS_CATEGORIES[index % FITNESS_CATEGORIES.length],
      bodyPart: index < 48 ? 'whole' : BODY_PARTS[index % BODY_PARTS.length],
      music: kind === 'audio' && index % 2 === 0,
      province: channel === 'school' ? '浙江省' : undefined,
      school: channel === 'school' ? '示例学校' : undefined,
      status: index === 47 ? 'offline' : 'published',
      publishedAt: new Date(Date.parse(now) - (index % 7) * 86400000).toISOString(),
      views: (index % 4) * 10,
      version: 1,
    })
  }
  const works: Work[] = (['draft', 'pending', 'published', 'rejected'] as const).map(
    (status, index) => ({
      id: `work-seed-${index + 1}`,
      userId: 'teacher',
      kind: 'practice',
      title: `教学实践示例 ${index + 1}`,
      summary: '课堂分组合作实践',
      cover: '/media/sample.png',
      category: 'practice',
      tags: ['合作'],
      stage: '',
      mode: 'article',
      body: '<h2>课堂实践</h2><p>分组进行运动练习。</p>',
      url: '',
      copyright: true,
      privacy: true,
      status,
      version: 1,
      createdAt: now,
      updatedAt: now,
      precheck: 'clear',
      submittedAt: status === 'draft' ? undefined : now,
      contentId: status === 'published' ? '32' : undefined,
    }),
  )
  contents[31]!.sourceWorkId = 'work-seed-3'
  return {
    schemaVersion: 1,
    sequence: 1000,
    users,
    sessions: [],
    challenges: [],
    contents,
    taxonomies,
    interactions: [
      { userId: 'teacher', contentId: '1', kind: 'favorite', createdAt: now },
      { userId: 'teacher', contentId: '48', kind: 'favorite', createdAt: now },
    ],
    views: [],
    works,
    reviews: [
      {
        id: 'review-seed-1',
        workId: 'work-seed-4',
        reviewerId: 'reviewer',
        result: 'rejected',
        reason: '请补充课堂实施过程。',
        createdAt: now,
        version: 1,
      },
    ],
    files: [],
    batches: [],
    entries: [],
    exchanges: [],
    exchangeOutcome: 'succeeded',
    lingyue: [{ userId: 'teacher', externalId: 'ly-teacher', linked: false }],
    slots: { featured: ['1', '4', '32'], popular: ['2', '3', '6'], coCreated: ['32'] },
    reports: [
      {
        id: 'report-1',
        contentId: '2',
        reason: '示例举报：请复核内容来源',
        status: 'pending',
        result: '',
        updatedAt: now,
      },
    ],
    audits: [],
    events: [],
    workingCopies: [],
    idempotency: [],
    faults: [],
  }
}
