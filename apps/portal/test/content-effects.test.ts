import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, onScopeDispose, shallowRef, watch, type EffectScope } from 'vue'
import { useContentInteractions } from '../app/pages/resources/composables/useContentInteractions'
import { useContentView } from '../app/pages/resources/composables/useContentView'
import { parseContentDetail } from '../app/utils/web-response'
import type { WebContentDetail } from '@isport/shared'

const mocks = vi.hoisted(() => ({
  academy: { like: vi.fn(), favorite: vi.fn(), view: vi.fn() },
  auth: { revision: 0, isLoggedIn: true },
  requireAuth: vi.fn(),
}))
vi.mock('../app/composables/useAcademy', () => ({ useAcademy: () => mocks.academy }))
vi.mock('../app/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('../app/composables/auth/useAuthGate', () => ({
  useAuthGate: () => ({ requireAuth: mocks.requireAuth }),
}))

const scopes: EffectScope[] = []
const clearCache = vi.fn()
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.revision = 0
  mocks.auth.isLoggedIn = true
  mocks.academy.like.mockResolvedValue({ active: true, count: 4 })
  mocks.academy.favorite.mockResolvedValue({ active: true, count: 3 })
  mocks.academy.view.mockResolvedValue(undefined)
  vi.stubGlobal('shallowRef', shallowRef)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('nextTick', nextTick)
  vi.stubGlobal('onScopeDispose', onScopeDispose)
  vi.stubGlobal('onMounted', vi.fn())
  vi.stubGlobal('clearNuxtData', clearCache)
  vi.stubGlobal('useNuxtApp', () => ({ runWithContext: (callback: () => unknown) => callback() }))
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.unstubAllGlobals()
})

function harness() {
  const scope = effectScope()
  scopes.push(scope)
  const detail = shallowRef<WebContentDetail | undefined>(
    parseContentDetail({
      channel: 'RESOURCE',
      origin: 'PLATFORM',
      originId: 1,
      contentKey: 'resource-1',
      title: '内容',
      detailType: 'ARTICLE',
      viewCount: 4,
      likeCount: 3,
      favoriteCount: 2,
    }),
  )
  const update = vi.fn((value: WebContentDetail) => {
    detail.value = value
  })
  const refresh = vi.fn(async () => {})
  const status = shallowRef<'idle' | 'pending' | 'success' | 'error'>('success')
  const error = shallowRef<unknown>(undefined)
  const interactions = scope.run(() => useContentInteractions({ detail, update, refresh }))!
  const views = scope.run(() => useContentView({ detail, update, status, error }))!
  return { scope, detail, update, refresh, interactions, views }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => {
    resolve = done
  })
  return { promise, resolve }
}

describe('内容互动', () => {
  it('采用服务端返回的计数，并忽略已达到目标状态的重复操作', async () => {
    const { detail, interactions } = harness()
    await interactions.setInteraction('like', true)
    expect(detail.value).toMatchObject({ liked: true, likeCount: 4 })
    expect(clearCache).toHaveBeenCalledTimes(1)
    await interactions.setInteraction('like', true)
    expect(mocks.academy.like).toHaveBeenCalledTimes(1)
    expect(interactions.pending.value).toBe(false)
  })

  it('访客登录后刷新正文并回放收藏操作', async () => {
    mocks.auth.isLoggedIn = false
    mocks.requireAuth.mockImplementation(
      async ({ onSuccess }: { onSuccess: () => Promise<void> }) => {
        mocks.auth.isLoggedIn = true
        mocks.auth.revision++
        await onSuccess()
      },
    )
    const { detail, refresh, interactions } = harness()
    await interactions.setInteraction('favorite', true)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(mocks.academy.favorite).toHaveBeenCalledTimes(1)
    expect(detail.value).toMatchObject({ favorited: true, favoriteCount: 3 })
  })

  it('旧会话的晚到互动结果不能覆盖新会话或清理其缓存', async () => {
    const delayed = deferred<{ active: boolean; count: number }>()
    mocks.academy.like.mockReturnValue(delayed.promise)
    const { detail, update, interactions } = harness()
    const pending = interactions.setInteraction('like', true)
    mocks.auth.revision++
    delayed.resolve({ active: true, count: 99 })
    await pending
    expect(detail.value?.liked).toBe(false)
    expect(update).not.toHaveBeenCalled()
    expect(clearCache).not.toHaveBeenCalled()
  })

  it('互动失败显示错误，重试成功后恢复', async () => {
    mocks.academy.like.mockRejectedValueOnce(new Error('offline'))
    const { interactions } = harness()
    await interactions.setInteraction('like', true)
    expect(interactions.interactionFailed.value).toBe(true)
    await interactions.setInteraction('like', true)
    expect(interactions.interactionFailed.value).toBe(false)
  })
})

describe('浏览统计', () => {
  it('失败后可重试，成功后同次访问只增加一次浏览数', async () => {
    mocks.academy.view.mockRejectedValueOnce(new Error('offline'))
    const { detail, views } = harness()
    await views.reportView()
    expect(views.viewFailed.value).toBe(true)
    await views.reportView()
    await views.reportView()
    expect(views.viewFailed.value).toBe(false)
    expect(detail.value?.viewCount).toBe(5)
    expect(mocks.academy.view).toHaveBeenCalledTimes(2)
  })

  it('会话变更后不应用旧浏览响应', async () => {
    const delayed = deferred<void>()
    mocks.academy.view.mockReturnValue(delayed.promise)
    const { update, views } = harness()
    const pending = views.reportView()
    mocks.auth.revision++
    delayed.resolve()
    await pending
    expect(update).not.toHaveBeenCalled()
  })

  it('离开页面后不应用尚未完成的浏览和互动响应', async () => {
    const view = deferred<void>()
    const like = deferred<{ active: boolean; count: number }>()
    mocks.academy.view.mockReturnValue(view.promise)
    mocks.academy.like.mockReturnValue(like.promise)
    const { scope, update, views, interactions } = harness()
    const pendingView = views.reportView()
    const pendingLike = interactions.setInteraction('like', true)
    scope.stop()
    view.resolve()
    like.resolve({ active: true, count: 99 })
    await Promise.all([pendingView, pendingLike])
    expect(update).not.toHaveBeenCalled()
    expect(clearCache).not.toHaveBeenCalled()
  })
})
