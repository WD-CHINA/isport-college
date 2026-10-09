/** 已接入能力以实际后端协议为准；这些入口尚无对应接口。 */
export const ACADEMY_CAPABILITIES = {
  admin: { enabled: false, titleKey: 'seo.adminTitle' },
  courseManagement: { enabled: false, titleKey: 'nav.courseManage' },
  creation: { enabled: false, titleKey: 'academy.creation' },
  points: { enabled: false, titleKey: 'creation.nav.points' },
  teacherProfile: { enabled: false, titleKey: 'creation.teacher.title' },
  lingyue: { enabled: false, titleKey: 'lingyue.title' },
} as const

export type AcademyCapability = keyof typeof ACADEMY_CAPABILITIES
