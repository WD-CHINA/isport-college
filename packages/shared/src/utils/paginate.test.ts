import { describe, expect, it } from 'vitest'

import { paginate } from './paginate'

const items = Array.from({ length: 25 }, (_, i) => i + 1)

describe('paginate', () => {
  it('按页码与页大小切片', () => {
    const result = paginate(items, { page: 2, pageSize: 10 })
    expect(result.list).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(result.total).toBe(25)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(10)
  })

  it('默认第一页', () => {
    const result = paginate(items)
    expect(result.list).toHaveLength(10)
    expect(result.page).toBe(1)
  })

  it('末页返回剩余元素', () => {
    const result = paginate(items, { page: 3, pageSize: 10 })
    expect(result.list).toEqual([21, 22, 23, 24, 25])
  })

  it('页码越界时返回空列表', () => {
    const result = paginate(items, { page: 99, pageSize: 10 })
    expect(result.list).toEqual([])
    expect(result.total).toBe(25)
  })

  it('非法页码与页大小被纠正为最小值', () => {
    const result = paginate(items, { page: 0, pageSize: 0 })
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(1)
    expect(result.list).toEqual([1])
  })
})
