export const CREATION_CONTENT_GROUPS = [
  { key: 'resources', types: ['demonstration', 'courseware'] },
  { key: 'cases', types: ['micro', 'lesson', 'practice'] },
] as const

export type CreationContentType = (typeof CREATION_CONTENT_GROUPS)[number]['types'][number]

export const CREATION_CONTENT_REWARDS: Record<CreationContentType, number> = {
  demonstration: 50,
  courseware: 50,
  micro: 100,
  lesson: 100,
  practice: 50,
}
