/** 站内能力以实际后端协议为准；外部服务入口单独声明跳转地址。 */
export const ACADEMY_CAPABILITIES = {
  admin: { enabled: false, titleKey: 'seo.adminTitle' },
  courseManagement: { enabled: false, titleKey: 'nav.courseManage' },
  creation: { enabled: false, titleKey: 'academy.creation' },
  points: { enabled: false, titleKey: 'creation.nav.points' },
  teacherProfile: { enabled: false, titleKey: 'creation.teacher.title' },
  lingyue: {
    enabled: false,
    titleKey: 'lingyue.title',
    externalUrl: 'https://lingyue.dream-sports.cn',
  },
} as const

export type AcademyCapability = keyof typeof ACADEMY_CAPABILITIES
