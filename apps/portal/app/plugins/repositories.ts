import {
  createMockAuthRepository,
  createMockCourseRepository,
  createMockDashboardRepository,
} from '@isport/api-client'

/**
 * Repository 依赖注入。
 * 首期使用 Mock 实现；接入真实后端时替换为 Http 实现，页面与组件不感知。
 * 每个 SSR 请求创建独立实例，避免跨请求共享可变状态。
 */
export default defineNuxtPlugin(() => {
  const latency: number | [number, number] = import.meta.dev ? [80, 240] : 120

  return {
    provide: {
      courseRepository: createMockCourseRepository({ latency }),
      authRepository: createMockAuthRepository({ latency }),
      dashboardRepository: createMockDashboardRepository({ latency }),
    },
  }
})
