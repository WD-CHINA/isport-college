import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, reactive, shallowRef, watch, type EffectScope, type ShallowRef } from 'vue'
import type { WebProfile } from '@isport/shared'
import { useLingyueLaunch } from '../app/composables/useLingyueLaunch'

const mocks = vi.hoisted(() => ({
  academy: { launchLingyue: vi.fn() },
  auth: {
    revision: 0,
    session: { token: 'token-1' } as { token: string } | null,
    user: null as WebProfile | null,
    updateUser: vi.fn(),
  },
  requireAuth: vi.fn(),
  open: vi.fn(),
}))
vi.mock('../app/composables/useAcademy', () => ({ useAcademy: () => mocks.academy }))
vi.mock('../app/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('../app/composables/auth/useAuthGate', () => ({
  useAuthGate: () => ({ requireAuth: mocks.requireAuth }),
}))

const scopes: EffectScope[] = []
const profile = (id: number): WebProfile => ({
  id,
  nickname: `用户${id}`,
  phoneMask: '138****8000',
  avatarCode: 1,
  nicknamePromptNeeded: false,
  lingyueBound: false,
})
const result = (token: string) => ({
  launchUrl: `https://lingyue.dream-sports.cn/launch?token=${token}`,
  lingyueBound: true,
})
function deferred() {
  let resolve!: (value: ReturnType<typeof result>) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<ReturnType<typeof result>>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth = reactive({
    revision: 0,
    session: { token: 'token-1' },
    user: profile(1),
    updateUser: vi.fn(),
  })
  mocks.requireAuth.mockImplementation(async ({ onSuccess }: { onSuccess: () => unknown }) => {
    await onSuccess()
    return true
  })
  const states = new Map<string, ShallowRef<unknown>>()
  vi.stubGlobal('useState', (key: string, init: () => unknown) => {
    if (!states.has(key)) states.set(key, shallowRef(init()))
    return states.get(key)
  })
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('useI18n', () => ({ t: (key: string) => key, locale: shallowRef('zh') }))
  vi.stubGlobal('window', { open: mocks.open })
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.unstubAllGlobals()
})
function harness() {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(() => useLingyueLaunch())!
}

describe('灵跃启动的会话隔离', () => {
  it('当前会话授权成功后更新关联状态并打开一次性地址', async () => {
    mocks.academy.launchLingyue.mockResolvedValue(result('current'))
    const launch = harness()
    launch.openLingyue({ target: 'home' })
    expect(launch.authorizeOpen.value).toBe(true)
    await launch.confirmAuthorize()
    expect(mocks.academy.launchLingyue).toHaveBeenCalledWith({ target: 'home', authorized: true })
    expect(mocks.auth.updateUser).toHaveBeenCalledWith(
      { ...profile(1), lingyueBound: true },
      'token-1',
    )
    expect(mocks.open).toHaveBeenCalledExactlyOnceWith(
      result('current').launchUrl,
      '_blank',
      'noopener,noreferrer',
    )
    expect(launch.authorizeOpen.value).toBe(false)
    expect(launch.pending.value).toBe(false)
  })

  it('退出后立即清理授权状态，旧启动响应不能打开链接', async () => {
    const delayed = deferred()
    mocks.academy.launchLingyue.mockReturnValue(delayed.promise)
    const launch = harness()
    launch.openLingyue({ target: 'home' })
    const request = launch.confirmAuthorize()
    mocks.auth.session = null
    mocks.auth.user = null
    mocks.auth.revision++
    expect(launch.authorizeOpen.value).toBe(false)
    expect(launch.pending.value).toBe(false)
    delayed.resolve(result('old'))
    await request
    expect(mocks.open).not.toHaveBeenCalled()
    expect(mocks.auth.updateUser).not.toHaveBeenCalled()
  })

  for (const outcome of ['success', 'failure'] as const) {
    it(`换号后的新授权不受旧请求${outcome === 'success' ? '成功' : '失败'}影响`, async () => {
      const old = deferred()
      const current = deferred()
      mocks.academy.launchLingyue
        .mockReturnValueOnce(old.promise)
        .mockReturnValueOnce(current.promise)
      const launch = harness()
      launch.openLingyue({ target: 'home' })
      const previous = launch.confirmAuthorize()
      mocks.auth.session = { token: 'token-2' }
      mocks.auth.user = profile(2)
      mocks.auth.revision++
      launch.openLingyue({ target: 'agent', agentCode: 'lesson-plan' })
      const next = launch.confirmAuthorize()
      if (outcome === 'success') old.resolve(result('old'))
      else old.reject(new Error('old failure'))
      await previous
      expect(mocks.open).not.toHaveBeenCalled()
      expect(launch.authorizeOpen.value).toBe(true)
      expect(launch.pending.value).toBe(true)
      expect(launch.error.value).toBe('')
      current.resolve(result('current'))
      await next
      expect(mocks.open).toHaveBeenCalledTimes(1)
      expect(mocks.open).toHaveBeenCalledWith(
        result('current').launchUrl,
        '_blank',
        'noopener,noreferrer',
      )
      expect(launch.pending.value).toBe(false)
    })
  }

  it('已关联入口同样丢弃旧会话的免登地址', async () => {
    mocks.auth.user = { ...profile(1), lingyueBound: true }
    const delayed = deferred()
    mocks.academy.launchLingyue.mockReturnValue(delayed.promise)
    const launch = harness()
    launch.openLingyue({ target: 'home' })
    const request = mocks.requireAuth.mock.results[0]!.value
    expect(launch.authorizeOpen.value).toBe(false)
    mocks.auth.revision++
    delayed.resolve(result('old'))
    await request
    expect(mocks.open).not.toHaveBeenCalled()
  })

  it('当前请求失败显示错误并允许再次授权，不产生未处理的拒绝', async () => {
    mocks.academy.launchLingyue.mockRejectedValue(new Error('offline'))
    const launch = harness()
    launch.openLingyue({ target: 'home' })
    await expect(launch.confirmAuthorize()).resolves.toBeUndefined()
    expect(launch.error.value).toBe('academy.requestFailed')
    expect(launch.authorizeOpen.value).toBe(true)
    expect(launch.pending.value).toBe(false)
  })
})
