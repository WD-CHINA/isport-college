import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, onScopeDispose, shallowRef, toValue, watch, type EffectScope } from 'vue'
import { useMessageFeedback } from '../app/composables/useMessageFeedback'

const scopes: EffectScope[] = []
let mount: () => void
beforeEach(() => {
  vi.stubGlobal('useId', () => 'feedback')
  vi.stubGlobal('shallowRef', shallowRef)
  vi.stubGlobal('toValue', toValue)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('onScopeDispose', onScopeDispose)
  vi.stubGlobal('onMounted', (callback: () => void) => {
    mount = callback
  })
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.unstubAllGlobals()
})

function harness(initial = '') {
  const scope = effectScope()
  scopes.push(scope)
  const error = shallowRef(initial)
  const api = {
    open: vi.fn(),
    destroy: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  }
  scope.run(() => useMessageFeedback(api, error, () => error.value))
  return { scope, error, api }
}

describe('hook 消息状态', () => {
  it('SSR 首屏错误只在客户端挂载后显示', () => {
    const { api } = harness('加载失败')
    expect(api.open).not.toHaveBeenCalled()
    mount()
    expect(api.open).toHaveBeenCalledExactlyOnceWith({
      key: 'feedback',
      type: 'error',
      content: '加载失败',
    })
  })

  it('重试清除错误时关闭旧消息，相同错误再次出现时重新提示', () => {
    const { api, error } = harness('加载失败')
    mount()
    api.destroy.mockClear()
    error.value = ''
    expect(api.destroy).toHaveBeenCalledExactlyOnceWith('feedback')
    error.value = '加载失败'
    expect(api.open).toHaveBeenCalledTimes(2)
  })

  it('离开组件后关闭消息，不再响应旧状态', () => {
    const { scope, api, error } = harness('加载失败')
    mount()
    scope.stop()
    expect(api.destroy).toHaveBeenCalledWith('feedback')
    error.value = '晚到错误'
    expect(api.open).toHaveBeenCalledTimes(1)
  })
})
