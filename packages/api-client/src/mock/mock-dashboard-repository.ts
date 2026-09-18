import { courseFixtures } from '@isport/mock-data'
import type { DashboardStats } from '@isport/shared'
import { delay, resolveLatency } from '@isport/shared'

import { ApiError } from '../errors'
import type { DashboardRepository } from '../repositories/dashboard'
import type { MockOptions } from './options'

/** Mock 仪表盘 Repository：从 Fixtures 派生统计数据 */
export class MockDashboardRepository implements DashboardRepository {
  private readonly latency?: number | [number, number]
  private readonly scenario: NonNullable<MockOptions['scenario']>

  constructor(options: MockOptions = {}) {
    this.latency = options.latency
    this.scenario = options.scenario ?? 'normal'
  }

  async getStats(): Promise<DashboardStats> {
    await delay(resolveLatency(this.latency))
    if (this.scenario === 'error') {
      throw ApiError.serviceUnavailable('Mock scenario: service unavailable')
    }

    const totalEnrollments = courseFixtures.reduce((sum, course) => sum + course.enrolled, 0)
    const totalCoaches = new Set(courseFixtures.map(course => course.coach)).size

    return {
      totalCourses: courseFixtures.length,
      totalEnrollments,
      totalCoaches,
      totalStudents: 486,
    }
  }
}

export function createMockDashboardRepository(options: MockOptions = {}): DashboardRepository {
  return new MockDashboardRepository(options)
}
