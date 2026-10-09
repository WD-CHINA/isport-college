import { describe, expect, it } from 'vitest'
import type { WebResourceFilters } from '../src/web-api'
import { contentQueryToUrl, normalizeContentQuery, parseListPage } from '../src/content-query'

const filters: WebResourceFilters = {
  categoryList: [
    { id: '1', name: '体能', parentId: null },
    { id: '2', name: '专项', parentId: null },
  ],
  secondCategoryList: [{ id: '10', name: '力量', parentId: '1' }],
  levelList: [{ id: '3', name: '三级', parentId: null }],
  bodyPartList: [{ id: '4', name: '上肢', parentId: null }],
  typeList: [{ id: '2', name: '文档', parentId: null }],
}

describe('学苑 URL 查询的唯一规则', () => {
  it('只保留当前协议支持的字段，并支持旧 level 链接', () => {
    expect(
      normalizeContentQuery(
        {
          category: '1',
          secondCategoryId: '10',
          level: '3',
          bodyPartTagId: '4',
          resourceType: '2',
          keyword: ' 合作 ',
          page: '2',
          pageSize: '999',
          fitness: 'legacy',
        },
        'resource',
        filters,
      ),
    ).toEqual({
      category: '1',
      secondCategoryId: '10',
      recommendedLevel: '3',
      bodyPartTagId: '4',
      resourceType: '2',
      keyword: '合作',
      page: 2,
    })
  })
  it('拒绝重复参数、未知筛选项与不匹配的二级分类', () => {
    expect(
      normalizeContentQuery(
        { category: ['1', '2'], recommendedLevel: '99', resourceType: '9', keyword: ['a'] },
        'resource',
        filters,
      ),
    ).toEqual({ page: 1 })
    expect(
      normalizeContentQuery({ category: '2', secondCategoryId: '10' }, 'resource', filters),
    ).toEqual({ page: 1, category: '2' })
  })
  it('教研与校本仅接受对应分类，清理资源参数', () => {
    expect(
      normalizeContentQuery(
        { category: 'SERIES', recommendedLevel: '3', resourceType: '2' },
        'research',
        filters,
      ),
    ).toEqual({ page: 1, category: 'SERIES' })
    expect(normalizeContentQuery({ category: 'SERIES' }, 'school')).toEqual({ page: 1 })
    expect(normalizeContentQuery({ category: 'DIGITAL' }, 'school')).toEqual({
      page: 1,
      category: 'DIGITAL',
    })
  })
  it('页码严格为 1..9999，不能用科学计数法、小数或重复参数', () => {
    for (const raw of ['0', '-1', '1.2', '1e2', '99999', '01', ['2'], undefined])
      expect(parseListPage(raw)).toBe(1)
    expect(parseListPage('9999')).toBe(9999)
  })
  it('序列化可往返，省略默认页码，关键词长度受限', () => {
    const query = normalizeContentQuery(
      { category: '1', level: '3', page: '2', keyword: ' 合作 ' },
      'resource',
      filters,
    )
    expect(normalizeContentQuery(contentQueryToUrl(query), 'resource', filters)).toEqual(query)
    expect(contentQueryToUrl({ ...query, page: 1 })).not.toHaveProperty('page')
    expect(normalizeContentQuery({ keyword: 'a'.repeat(120) }, 'resource').keyword).toHaveLength(
      100,
    )
  })
})
