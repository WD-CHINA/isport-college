import { describe, expect, it } from 'vitest'

import { isValidCnMobile, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it('移除手机号中的空格', () => {
    expect(normalizePhone('188 8888 8888')).toBe('18888888888')
    expect(normalizePhone(' 188 8888 8888 ')).toBe('18888888888')
  })

  it('无空格时保持原样', () => {
    expect(normalizePhone('18888888888')).toBe('18888888888')
  })
})

describe('isValidCnMobile', () => {
  it('接受带空格与不加分隔的演示手机号', () => {
    expect(isValidCnMobile('188 8888 8888')).toBe(true)
    expect(isValidCnMobile('18888888888')).toBe(true)
  })

  it('拒绝非法手机号', () => {
    expect(isValidCnMobile('1234567890')).toBe(false)
    expect(isValidCnMobile('28888888888')).toBe(false)
    expect(isValidCnMobile('')).toBe(false)
  })
})
