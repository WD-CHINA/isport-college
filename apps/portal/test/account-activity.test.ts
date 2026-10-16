import { describe, expect, it, vi } from 'vitest'
import type { WebContentCard, WebPage } from '@isport/shared'
import { loadAccountActions } from '../app/utils/account-activity'

const card = (contentKey: string) => ({ contentKey }) as WebContentCard
const page = (list: WebContentCard[]): WebPage<WebContentCard> => ({
  total: 5,
  pageNum: 1,
  pageSize: 2,
  list,
})

describe('账号有效关系列表', () => {
  it('空白页和不足一页都继续扫描，计数只包含有效内容并保留关系顺序', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([card('RESEARCH:2')]))
      .mockResolvedValueOnce(page([card('RESOURCE:1')]))
    const result = await loadAccountActions(fetch)
    expect(fetch.mock.calls).toEqual([[1], [2], [3]])
    expect(result.map(item => item.contentKey)).toEqual(['RESEARCH:2', 'RESOURCE:1'])
  })
  it('分页重叠时同一内容只计一次', async () => {
    const fetch = vi.fn().mockResolvedValue(page([card('RESOURCE:1')]))
    expect(await loadAccountActions(fetch)).toHaveLength(1)
  })
  it('后续页失败不返回不完整总数', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([card('RESOURCE:1')]))
      .mockRejectedValueOnce(new Error('failed'))
    await expect(loadAccountActions(fetch)).rejects.toThrow('failed')
  })
})
