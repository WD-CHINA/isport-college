import type { AuthRepository, CourseRepository, DashboardRepository } from '@isport/api-client'

declare module '#app' {
  interface NuxtApp {
    $courseRepository: CourseRepository
    $authRepository: AuthRepository
    $dashboardRepository: DashboardRepository
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $courseRepository: CourseRepository
    $authRepository: AuthRepository
    $dashboardRepository: DashboardRepository
  }
}

export {}
