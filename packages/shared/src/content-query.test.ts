import { describe, expect, it } from 'vitest'
import type { Taxonomy } from './academy'
import { contentQueryToUrl, normalizeContentQuery } from './content-query'

const taxonomies: Taxonomy[] = [
  {
    id: 'fitness',
    channel: 'resource',
    enabled: true,
    order: 0,
    label: { 'zh-CN': '体能', 'en-US': 'Fitness' },
  },
  {
    id: 'sport',
    channel: 'resource',
    enabled: true,
    order: 1,
    label: { 'zh-CN': '专项技能', 'en-US': 'Sports' },
  },
  {
    id: 'old',
    channel: 'resource',
    enabled: false,
    order: 2,
    label: { 'zh-CN': '停用', 'en-US': 'Disabled' },
  },
  {
    id: 'practice',
    channel: 'research',
    enabled: true,
    order: 3,
    label: { 'zh-CN': '实践', 'en-US': 'Practice' },
  },
]

describe('公开内容 URL 查询', () => {
  it('资源默认体能且使用固定分页，其他栏目默认全部', () => {
    expect(normalizeContentQuery({}, 'resource', taxonomies)).toEqual({
      channel: 'resource',
      category: 'fitness',
      page: 1,
      pageSize: 12,
    })
    expect(normalizeContentQuery({}, 'research', taxonomies)).toEqual({
      channel: 'research',
      page: 1,
      pageSize: 12,
    })
  })
  it('拒绝重复、越界、跨栏目、停用分类和不支持的媒体参数', () => {
    for (const category of ['practice', 'old', ['fitness', 'sport']]) {
      const result = normalizeContentQuery(
        { category, page: '0', level: '6', kind: 'link', keyword: ['a'], pageSize: 100 },
        'resource',
        taxonomies,
      )
      expect(result).toEqual({ channel: 'resource', category: 'fitness', page: 1, pageSize: 12 })
    }
    for (const page of ['-1', 'NaN', '1.2', '1e2', '99999']) {
      expect(normalizeContentQuery({ page }, 'resource', taxonomies).page).toBe(1)
    }
  })
  it('分类切换清理专属条件，教研不会继承资源筛选', () => {
    const raw = {
      category: 'sport',
      fitness: 'strength',
      bodyPart: 'whole',
      level: '3',
      kind: 'courseware',
    }
    expect(normalizeContentQuery(raw, 'resource', taxonomies)).toEqual({
      channel: 'resource',
      category: 'sport',
      page: 1,
      pageSize: 12,
      level: 3,
      kind: 'courseware',
    })
    expect(normalizeContentQuery(raw, 'research', taxonomies)).toEqual({
      channel: 'research',
      page: 1,
      pageSize: 12,
    })
  })
  it('组合条件可往返序列化，trim 关键词并移除默认页码', () => {
    const raw = {
      category: 'fitness',
      fitness: 'strength',
      bodyPart: 'whole',
      level: '3',
      page: '2',
      kind: 'courseware',
      keyword: '  合作  ',
    }
    const normalized = normalizeContentQuery(raw, 'resource', taxonomies)
    const url = contentQueryToUrl(normalized)
    expect(url.keyword).toBe('合作')
    expect(normalizeContentQuery(url, 'resource', taxonomies)).toEqual(normalized)
    expect(contentQueryToUrl({ ...normalized, page: 1 })).not.toHaveProperty('page')
  })
})
