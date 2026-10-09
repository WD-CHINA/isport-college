import { describe, expect, it } from 'vitest'
import { LOCALE_URL_CODES, LOCALE_URL_PREFIXES } from '../src/constants'
import {
  isAdminRoutePath,
  isPrivateRoutePath,
  normalizeRoutePath,
  stripLocalePrefix,
} from '../src/routing'

describe('stripLocalePrefix', () => {
  it('剥离已声明的语言前缀，且大小写不敏感', () => {
    expect(stripLocalePrefix('/en/admin')).toBe('/admin')
    expect(stripLocalePrefix('/EN/admin/courses')).toBe('/admin/courses')
    expect(stripLocalePrefix('/en')).toBe('/')
  })

  it('不误伤业务路径与相似前缀', () => {
    expect(stripLocalePrefix('/admin/courses')).toBe('/admin/courses')
    expect(stripLocalePrefix('/english')).toBe('/english')
    expect(stripLocalePrefix('/en-us/courses')).toBe('/en-us/courses')
  })

  it('前缀集合与语言码映射保持一致', () => {
    expect(LOCALE_URL_PREFIXES.every(prefix => prefix in LOCALE_URL_CODES)).toBe(true)
    expect(LOCALE_URL_PREFIXES).not.toContain('zh')
  })
})

describe('normalizeRoutePath', () => {
  it('统一大小写、尾斜杠、查询串与哈希', () => {
    expect(normalizeRoutePath('/Admin/Courses/')).toBe('/admin/courses')
    expect(normalizeRoutePath('/Admin/Courses?tab=1')).toBe('/admin/courses')
    expect(normalizeRoutePath('/admin/works#top')).toBe('/admin/works')
    expect(normalizeRoutePath('/')).toBe('/')
  })

  it('语言前缀与大小写可以叠加', () => {
    expect(normalizeRoutePath('/EN/Admin/Courses')).toBe('/admin/courses')
  })
})

describe('isAdminRoutePath', () => {
  it.each([
    ['/admin', true],
    ['/admin/', true],
    ['/admin/courses', true],
    ['/Admin/Courses', true],
    ['/ADMIN/courses', true],
    ['/en/admin/courses', true],
    ['/en/Admin/courses', true],
    ['/administration', false],
    ['/resources', false],
    ['/account', false],
  ])('%s -> %s', (path, expected) => {
    expect(isAdminRoutePath(path)).toBe(expected)
  })
})

describe('isPrivateRoutePath', () => {
  it.each([
    ['/account/teacher', true],
    ['/Account/Teacher', true],
    ['/en/account/teacher', true],
    ['/account', false],
  ])('%s -> %s', (path, expected) => {
    expect(isPrivateRoutePath(path)).toBe(expected)
  })
})
