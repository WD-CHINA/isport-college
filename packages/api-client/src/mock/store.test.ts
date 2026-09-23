import { describe, expect, it } from 'vitest'
import {
  createMockSnapshot,
  createMockStore,
  type MockSnapshot,
  type SnapshotStorage,
} from './index'

function memoryStorage() {
  const snapshots = new Map<string, MockSnapshot>()
  let fail = false
  const storage: SnapshotStorage = {
    async load(key) {
      return snapshots.get(key)
    },
    async save(key, value) {
      if (fail) throw new Error('模拟磁盘失败')
      snapshots.set(key, JSON.parse(JSON.stringify(value)) as MockSnapshot)
    },
  }
  return {
    storage,
    snapshots,
    setFailure: (value: boolean) => {
      fail = value
    },
  }
}

describe('Mock 串行事务', () => {
  it('并发写入不丢失，重建引擎后仍可读取', async () => {
    const { storage } = memoryStorage()
    const store = createMockStore(storage)
    const ids = await Promise.all(
      Array.from({ length: 30 }, () => store.transaction('case', state => ++state.sequence)),
    )
    expect(new Set(ids).size).toBe(30)
    expect(await createMockStore(storage).transaction('case', state => state.sequence)).toBe(1030)
  })
  it('业务异常与持久化异常均回滚，后续队列继续执行', async () => {
    const { storage, setFailure } = memoryStorage()
    const store = createMockStore(storage)
    await store.transaction('case', () => undefined)
    await expect(
      store.transaction('case', state => {
        state.sequence++
        throw new Error('失败')
      }),
    ).rejects.toThrow('失败')
    setFailure(true)
    await expect(store.transaction('case', state => ++state.sequence)).rejects.toThrow(
      '模拟磁盘失败',
    )
    setFailure(false)
    expect(await store.transaction('case', state => state.sequence)).toBe(1000)
  })
  it('命名空间隔离，返回对象不能篡改内部状态', async () => {
    const store = createMockStore(memoryStorage().storage)
    const result = await store.transaction('a', state => {
      state.users[0]!.name = '甲甲'
      return state.users[0]!
    })
    result.name = '篡改'
    expect(await store.transaction('a', state => state.users[0]!.name)).toBe('甲甲')
    expect(await store.transaction('b', state => state.users[0]!.name)).toBe('体育老师')
    expect(() => store.transaction('../escape', () => null)).toThrow('命名空间')
  })
  it('重置清除时钟、会话和故障，并可恢复不兼容快照', async () => {
    const { storage, snapshots } = memoryStorage()
    const store = createMockStore(storage)
    await store.transaction('case', state => {
      state.clock = '2099-01-01T00:00:00Z'
      state.users = []
    })
    await store.reset('case')
    expect(await store.transaction('case', state => state)).toEqual(createMockSnapshot())
    snapshots.set('old', { ...createMockSnapshot(), schemaVersion: 0 } as unknown as MockSnapshot)
    await expect(store.transaction('old', state => state)).rejects.toThrow('版本不兼容')
    await store.reset('old')
    expect(await store.transaction('old', state => state.schemaVersion)).toBe(1)
  })
})
