import { courseFixtures } from '@isport/mock-data'
import type { Course, CourseDetail, PageResult } from '@isport/shared'
import { paginate } from '@isport/shared'

import { ApiError } from '../errors'
import type { CourseListQuery, CoursePayload, CourseRepository } from '../repositories/course'
import { delay, resolveLatency } from './delay'
import type { MockOptions } from './options'

function cloneCourse(course: CourseDetail): CourseDetail {
  return structuredClone(course)
}

function assertPayload(payload: CoursePayload): void {
  const issues: string[] = []
  if (!payload.name['zh-CN'].trim() || !payload.name['en-US'].trim()) issues.push('name')
  if (!payload.coach.trim()) issues.push('coach')
  if (!Number.isFinite(payload.durationMin) || payload.durationMin <= 0) issues.push('durationMin')
  if (!Number.isFinite(payload.capacity) || payload.capacity <= 0) issues.push('capacity')
  if (!Number.isFinite(payload.price) || payload.price < 0) issues.push('price')
  if (Number.isNaN(Date.parse(payload.startDate))) issues.push('startDate')
  if (issues.length > 0) {
    throw ApiError.validation('Course payload validation failed', { fields: issues })
  }
}

/**
 * Mock 课程 Repository：以 Fixtures 为种子的内存实现。
 * 用户产生的演示数据（报名数、增删改）仅保存在当前实例内存中，不影响 SSR 初始输出。
 */
export class MockCourseRepository implements CourseRepository {
  private courses: CourseDetail[]
  private readonly latency?: number | [number, number]
  private readonly scenario: NonNullable<MockOptions['scenario']>

  constructor(options: MockOptions = {}) {
    this.courses = courseFixtures.map(cloneCourse)
    this.latency = options.latency
    this.scenario = options.scenario ?? 'normal'
  }

  private async respond(): Promise<void> {
    await delay(resolveLatency(this.latency))
    if (this.scenario === 'error') {
      throw ApiError.serviceUnavailable('Mock scenario: service unavailable')
    }
  }

  async list(query: CourseListQuery): Promise<PageResult<Course>> {
    await this.respond()

    if (this.scenario === 'empty') {
      return paginate([], query)
    }

    const keyword = query.keyword?.trim().toLowerCase()
    let filtered = this.courses

    if (keyword) {
      filtered = filtered.filter(
        course =>
          course.name['zh-CN'].toLowerCase().includes(keyword) ||
          course.name['en-US'].toLowerCase().includes(keyword) ||
          course.coach.toLowerCase().includes(keyword),
      )
    }
    if (query.category) {
      filtered = filtered.filter(course => course.category === query.category)
    }
    if (query.level) {
      filtered = filtered.filter(course => course.level === query.level)
    }
    if (query.featured) {
      filtered = filtered.filter(course => course.featured)
    }

    return paginate(filtered, query)
  }

  async getById(id: string): Promise<CourseDetail> {
    await this.respond()

    const course = this.courses.find(item => item.id === id)
    if (!course) {
      throw ApiError.notFound(`Course ${id} not found`)
    }
    return cloneCourse(course)
  }

  async enroll(id: string): Promise<void> {
    await this.respond()

    const course = this.courses.find(item => item.id === id)
    if (!course) {
      throw ApiError.notFound(`Course ${id} not found`)
    }
    if (course.enrolled >= course.capacity) {
      throw ApiError.validation('Course is full', { courseId: id })
    }
    course.enrolled += 1
  }

  async create(payload: CoursePayload): Promise<CourseDetail> {
    await this.respond()
    assertPayload(payload)

    const course: CourseDetail = {
      ...structuredClone(payload),
      id: `c-${Date.now().toString(36)}`,
      enrolled: 0,
    }
    this.courses.unshift(course)
    return cloneCourse(course)
  }

  async update(id: string, payload: CoursePayload): Promise<CourseDetail> {
    await this.respond()
    assertPayload(payload)

    const index = this.courses.findIndex(item => item.id === id)
    if (index === -1) {
      throw ApiError.notFound(`Course ${id} not found`)
    }
    const previous = this.courses[index]!
    const next: CourseDetail = {
      ...structuredClone(payload),
      id,
      enrolled: Math.min(previous.enrolled, payload.capacity),
    }
    this.courses[index] = next
    return cloneCourse(next)
  }

  async remove(id: string): Promise<void> {
    await this.respond()

    const index = this.courses.findIndex(item => item.id === id)
    if (index === -1) {
      throw ApiError.notFound(`Course ${id} not found`)
    }
    this.courses.splice(index, 1)
  }
}

export function createMockCourseRepository(options: MockOptions = {}): CourseRepository {
  return new MockCourseRepository(options)
}
