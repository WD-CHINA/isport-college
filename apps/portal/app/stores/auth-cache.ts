import { defineStore } from 'pinia'
import type { WebProfile } from '@isport/shared'

/** 登录资料的客户端持久化；仅浏览器读写，不参与 Cookie / SSR payload。 */
export const useAuthCacheStore = defineStore(
  'auth-cache',
  () => {
    const token = ref('')
    const profile = ref<WebProfile | null>(null)
    const newUser = ref(false)
    return { token, profile, newUser }
  },
  {
    persist: {
      key: 'ic_auth',
      // storage 由 nuxt.config 的 piniaPluginPersistedstate.storage = localStorage 提供。
    },
  },
)
