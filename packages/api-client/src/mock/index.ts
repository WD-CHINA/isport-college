import { createMockSnapshot, type MockSnapshot } from '@isport/mock-data'
import type { ProductPhase } from '@isport/shared'
import { ApiError } from '../errors'
import { handleAuth } from './auth'
import { handleContent } from './content'
import { CommittedError, object, type MockContext } from './context'
import { handleCreation } from './creation'
import { handleOperations } from './operations'
import { handlePoints } from './points'

export type { MockSnapshot } from '@isport/mock-data'
export { MOCK_RULES, createMockSnapshot } from '@isport/mock-data'
export { CommittedError, currentUser, requireUser, requireP1, type MockContext } from './context'

export interface SnapshotStorage {
  load(namespace: string): Promise<MockSnapshot | undefined>
  save(namespace: string, snapshot: MockSnapshot): Promise<void>
}

function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T)
}

export function validateNamespace(value: string): string {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(value)) throw ApiError.validation('Mock 命名空间不合法')
  return value
}

/** 单实例 Mock 的事务边界；每个命名空间串行，持久化成功后才对后续请求可见。 */
export function createMockStore(storage: SnapshotStorage) {
  const queues = new Map<string, Promise<unknown>>()
  const cache = new Map<string, MockSnapshot>()
  function transaction<T>(
    namespace: string,
    run: (state: MockSnapshot) => T | Promise<T>,
    reset = false,
  ): Promise<T> {
    validateNamespace(namespace)
    const task = (queues.get(namespace) ?? Promise.resolve())
      .catch(() => {})
      .then(async () => {
        let current = reset ? createMockSnapshot() : cache.get(namespace)
        if (!current) {
          current = (await storage.load(namespace)) ?? createMockSnapshot()
          if (current.schemaVersion !== 1)
            throw ApiError.serviceUnavailable('Mock 数据版本不兼容，请显式重置')
        }
        const draft = clone(current)
        let result: T | undefined
        let failure: unknown
        try {
          result = await run(draft)
        } catch (error) {
          if (!(error instanceof CommittedError)) throw error
          failure = error
        }
        await storage.save(namespace, draft)
        cache.set(namespace, draft)
        if (failure) throw failure
        return clone(result) as T
      })
    queues.set(namespace, task)
    void task
      .finally(() => {
        if (queues.get(namespace) === task) queues.delete(namespace)
      })
      .catch(() => {})
    return task
  }
  return {
    transaction,
    reset: (namespace: string) => transaction(namespace, () => ({ ok: true }), true),
  }
}

export interface MockRequestOptions {
  phase: ProductPhase
  token?: string
  now: string
  randomId: () => string
}

/** 仅服务器入口导出，未知操作失败关闭，不调用任何外部服务。 */
export async function executeMock(
  state: MockSnapshot,
  operation: string,
  payload: unknown,
  options: MockRequestOptions,
): Promise<unknown> {
  const input = object(payload)
  const ctx: MockContext = { ...options, state, now: state.clock ?? options.now }
  const fault = state.faults.find(item => item.operation === operation && item.remaining > 0)
  if (fault) {
    fault.remaining--
    if (fault.kind === 'delay' || fault.kind === 'timeout')
      await new Promise(resolve => setTimeout(resolve, Math.min(fault.delayMs, 35000)))
    if (fault.kind === 'error' || fault.kind === 'timeout') {
      const code =
        fault.status === 401
          ? 'UNAUTHORIZED'
          : fault.status === 403
            ? 'FORBIDDEN'
            : fault.status === 404
              ? 'NOT_FOUND'
              : fault.status === 400
                ? 'VALIDATION_FAILED'
                : 'SERVICE_UNAVAILABLE'
      throw new CommittedError(code, '模拟请求失败，请重试')
    }
  }
  for (const handler of [
    handleAuth,
    handleContent,
    handleCreation,
    handlePoints,
    handleOperations,
  ]) {
    const result = handler(ctx, operation, input)
    if (result !== undefined) {
      if (fault?.kind === 'lost-response')
        throw new CommittedError('SERVICE_UNAVAILABLE', '操作已提交，模拟响应丢失')
      if (fault?.kind === 'empty' && operation.endsWith('/list'))
        return { list: [], total: 0, page: 1, pageSize: 12, totals: { like: 0, favorite: 0 } }
      return result
    }
  }
  throw ApiError.notFound('接口尚未实现')
}
