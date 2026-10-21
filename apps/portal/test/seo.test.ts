import { describe, expect, it } from 'vitest'
import { canonicalUrl, isSearchPage, jsonLd, SITE_URL } from '../app/utils/seo'

describe('公开页面标准网址', () => {
  it('去掉追踪与第一页参数，保留独立分页与语言', () => {
    expect(canonicalUrl('/resources/', { page: '1', utm_source: 'test' })).toBe(
      `${SITE_URL}/resources`,
    )
    expect(canonicalUrl('/en/research', { page: '2', utm_source: 'test' })).toBe(
      `${SITE_URL}/en/research?page=2`,
    )
  })
  it('筛选参数顺序固定，不接受数组或非法页码', () => {
    expect(canonicalUrl('/schools', { page: '-1', category: 'DIGITAL', ignored: '1' })).toBe(
      `${SITE_URL}/schools?category=DIGITAL`,
    )
    expect(canonicalUrl('/resources', { page: ['2'], keyword: ['test'] })).toBe(
      `${SITE_URL}/resources`,
    )
  })
  it('地址不能通过双斜杠改成外部域名', () => {
    expect(new URL(canonicalUrl('//outside.example/path')).origin).toBe(SITE_URL)
  })
  it('仅将实际站内搜索结果标记为不收录', () => {
    expect(isSearchPage('/en/resources', { keyword: ' 体育 ' })).toBe(true)
    expect(isSearchPage('/resources', { keyword: '  ' })).toBe(false)
    expect(isSearchPage('/preview/resource/resources/905', { keyword: '体育' })).toBe(false)
  })
  it('结构化数据不可关闭 script，转义后数据保持一致', () => {
    const value = { headline: '</script><script>alert(1)</script>&' }
    expect(jsonLd(value)).not.toContain('<')
    expect(JSON.parse(jsonLd(value))).toEqual(value)
  })
})
