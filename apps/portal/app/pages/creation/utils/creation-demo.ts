import type { CreationContentType } from './content-types'

/** Ardot 139:8112 的静态演示数据，不代表当前登录账号的作品或积分。 */
export const CREATION_DEMO_POINTS = { balance: 220, monthGain: 25, monthSpend: 80 } as const

export const CREATION_DEMO_COUNTS = { published: 13, pending: 1, drafts: 0 } as const
export type CreationWorkStatus = keyof typeof CREATION_DEMO_COUNTS

export interface CreationDemoWork {
  id: string
  type: CreationContentType
  titleKey: string
  date: string
}

export const CREATION_DEMO_WORKS: CreationDemoWork[] = [
  { id: 'dribbling', type: 'courseware', titleKey: 'dribbling', date: '2026-10-23' },
  { id: 'running', type: 'practice', titleKey: 'running', date: '2026-10-23' },
  { id: 'rowing', type: 'micro', titleKey: 'rowing', date: '2026-10-23' },
  { id: 'basketball', type: 'lesson', titleKey: 'basketball', date: '2026-10-23' },
]

export const CREATION_DEMO_WORKS_BY_STATUS: Record<CreationWorkStatus, CreationDemoWork[]> = {
  published: CREATION_DEMO_WORKS,
  pending: CREATION_DEMO_WORKS.slice(0, 1),
  drafts: [],
}
