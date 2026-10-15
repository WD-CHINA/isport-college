import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref, shallowRef, watch } from 'vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { useAuthCacheStore } from '../app/stores/auth-cache'

const profile = {
  id: 1,
  phoneMask: '138****8000',
  nickname: '缓存用户',
  avatarCode: 1,
  nicknamePromptNeeded: false,
  lingyueBound: false,
}

const memory = new Map<string, string>()

function createPersistedPinia(): Pinia {
  const pinia = createPinia()
  // 单测没有 app.use(pinia)；先挂上假 app，否则 use() 只进 toBeInstalled 不会生效。
  // @ts-expect-error 测试专用：模拟已安装到 Vue app
  pinia._a = {}
  pinia.use(
    createPersistedState({
      storage: {
        getItem: key => memory.get(key) ?? null,
        setItem: (key, value) => {
          memory.set(key, value)
        },
      },
    }),
  )
  return pinia
}

beforeEach(() => {
  memory.clear()
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('shallowRef', shallowRef)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('ref', ref)
  setActivePinia(createPersistedPinia())
})

describe('auth-cache 持久化', () => {
  it('将令牌与资料写入配置的 storage', () => {
    const cache = useAuthCacheStore()
    cache.$patch({ token: 'token-1', profile, newUser: true })
    expect(memory.get('ic_auth')).toContain('token-1')
    expect(memory.get('ic_auth')).toContain('缓存用户')
    expect(memory.get('ic_auth')).toContain('"newUser":true')
  })

  it('可从 storage 恢复到新的 store 实例', () => {
    useAuthCacheStore().$patch({ token: 'token-2', profile, newUser: false })
    setActivePinia(createPersistedPinia())
    const restored = useAuthCacheStore()
    expect(restored.token).toBe('token-2')
    expect(restored.profile?.nickname).toBe('缓存用户')
    expect(restored.newUser).toBe(false)
  })
})
