import { describe, expect, it } from 'vitest'
import { createMockSnapshot, MOCK_RULES } from './index'

type Identified = { id: string }
const unique = (items: Identified[]) => new Set(items.map(item => item.id)).size === items.length

describe('学苑演示种子', () => {
  it('固定输入生成独立、稳定的快照', () => {
    const first = createMockSnapshot()
    const second = createMockSnapshot()
    expect(first).toEqual(second)
    first.users[0]!.name = '修改'
    expect(second.users[0]!.name).not.toBe('修改')
  })
  it('实体 ID 唯一且所有关系引用有效', () => {
    const state = createMockSnapshot()
    for (const rows of [state.users, state.contents, state.taxonomies, state.works])
      expect(unique(rows)).toBe(true)
    for (const content of state.contents) {
      expect(
        state.taxonomies.some(
          item => item.id === content.category && item.channel === content.channel,
        ),
      ).toBe(true)
      expect(Number.isFinite(Date.parse(content.publishedAt))).toBe(true)
      expect(content.title['en-US']).not.toBe(content.title['zh-CN'])
    }
    for (const relation of state.interactions) {
      expect(state.users.some(item => item.id === relation.userId)).toBe(true)
      expect(state.contents.some(item => item.id === relation.contentId)).toBe(true)
    }
  })
  it('覆盖角色、媒体、作品状态、失效关系和分页', () => {
    const state = createMockSnapshot()
    expect(new Set(state.users.flatMap(user => user.roles))).toEqual(
      new Set(['user', 'reviewer', 'operator', 'admin']),
    )
    expect(new Set(state.contents.map(item => item.media.kind))).toEqual(
      new Set(['video', 'image', 'audio', 'pdf', 'ppt', 'link', 'article']),
    )
    expect(new Set(state.works.map(item => item.status))).toEqual(
      new Set(['draft', 'pending', 'published', 'rejected']),
    )
    expect(state.contents.filter(item => item.status === 'published').length).toBeGreaterThan(
      MOCK_RULES.pageSize * 2,
    )
    expect(
      state.interactions.some(
        item => state.contents.find(content => content.id === item.contentId)?.status === 'offline',
      ),
    ).toBe(true)
    expect(state.batches).toEqual([])
  })
})
