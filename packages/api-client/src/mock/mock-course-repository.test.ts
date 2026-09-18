import { courseFixtures } from '@isport/mock-data'
import { describe, expect, it } from 'vitest'

import { ApiError } from '../errors'
import type { CoursePayload } from '../repositories/course'
import { MockCourseRepository } from './mock-course-repository'

const validPayload: CoursePayload = {
  name: { 'zh-CN': '测试课程', 'en-US': 'Test Course' },
  category: 'fitness',
  level: 'beginner',
  coach: '测试教练',
  durationMin: 60,
  capacity: 10,
  price: 100,
  startDate: '2026-12-01T10:00:00+08:00',
  location: { 'zh-CN': '测试场馆', 'en-US': 'Test Venue' },
  description: { 'zh-CN': '简介', 'en-US': 'Description' },
  schedule: { 'zh-CN': '每周一', 'en-US': 'Mon' },
  featured: false,
}

describe('MockCourseRepository', () => {
  it('list 默认返回全部课程分页', async () => {
    const repo = new MockCourseRepository()
    const result = await repo.list({ page: 1, pageSize: 20 })
    expect(result.total).toBe(courseFixtures.length)
    expect(result.list).toHaveLength(courseFixtures.length)
  })

  it('list 支持关键词、分类与难度筛选', async () => {
    const repo = new MockCourseRepository()
    const byKeyword = await repo.list({ keyword: '游泳', pageSize: 50 })
    expect(byKeyword.total).toBeGreaterThan(0)
    expect(byKeyword.list.every(c => c.category === 'swim')).toBe(true)

    const byCategory = await repo.list({ category: 'fitness', pageSize: 50 })
    expect(byCategory.list.every(c => c.category === 'fitness')).toBe(true)

    const byLevel = await repo.list({ level: 'advanced', pageSize: 50 })
    expect(byLevel.list.every(c => c.level === 'advanced')).toBe(true)
  })

  it('empty 场景返回空列表', async () => {
    const repo = new MockCourseRepository({ scenario: 'empty' })
    const result = await repo.list({})
    expect(result.total).toBe(0)
    expect(result.list).toEqual([])
  })

  it('error 场景抛出 SERVICE_UNAVAILABLE', async () => {
    const repo = new MockCourseRepository({ scenario: 'error' })
    await expect(repo.list({})).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' })
  })

  it('getById 对未知 id 抛出 NOT_FOUND', async () => {
    const repo = new MockCourseRepository()
    await expect(repo.getById('c-404')).rejects.toBeInstanceOf(ApiError)
    await expect(repo.getById('c-404')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('enroll 成功后已报名人数加一', async () => {
    const repo = new MockCourseRepository()
    const before = await repo.getById('c-001')
    await repo.enroll('c-001')
    const after = await repo.getById('c-001')
    expect(after.enrolled).toBe(before.enrolled + 1)
  })

  it('enroll 满员课程抛出 VALIDATION_FAILED', async () => {
    const repo = new MockCourseRepository()
    // c-002 在 Fixtures 中为满员课程
    await expect(repo.enroll('c-002')).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })
  })

  it('create / update / remove 形成完整闭环', async () => {
    const repo = new MockCourseRepository()
    const created = await repo.create(validPayload)
    expect(created.id).toBeTruthy()
    expect(created.enrolled).toBe(0)

    const updated = await repo.update(created.id, { ...validPayload, price: 168 })
    expect(updated.price).toBe(168)

    await repo.remove(created.id)
    await expect(repo.getById(created.id)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('非法载荷触发 VALIDATION_FAILED', async () => {
    const repo = new MockCourseRepository()
    await expect(repo.create({ ...validPayload, capacity: 0 })).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    })
  })
})
