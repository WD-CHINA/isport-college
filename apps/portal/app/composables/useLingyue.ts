export function useLingyue() {
  const academy = useAcademy()
  const auth = useAuthStore()
  const nuxt = useNuxtApp()
  const localePath = useLocalePath()
  const state = useState('academy-lingyue', () => ({
    open: false,
    pending: false,
    authorize: false,
    failed: false,
    generation: 0,
    successfulUser: '',
  }))
  function cancel() {
    state.value = {
      open: false,
      pending: false,
      authorize: false,
      failed: false,
      generation: state.value.generation + 1,
      successfulUser: '',
    }
  }
  async function run(authorize = false) {
    if (state.value.pending) return
    if (!auth.isLoggedIn) {
      auth.openLoginModal({ reason: 'lingyue', onSuccess: () => run(false) })
      return
    }
    const token = auth.session?.token
    const generation = ++state.value.generation
    state.value.open = true
    state.value.pending = true
    state.value.failed = false
    try {
      const result = await academy.call('lingyue/enter', { authorize })
      if (generation !== state.value.generation || token !== auth.session?.token) return
      state.value.authorize = result.status === 'authorization_required'
      if (result.status === 'linked') {
        state.value.open = false
        state.value.successfulUser = auth.user!.id
        await nuxt.runWithContext(() => navigateTo(localePath('/lingyue/simulation')))
      }
    } catch {
      if (generation === state.value.generation && token === auth.session?.token)
        state.value.failed = true
    } finally {
      if (generation === state.value.generation) state.value.pending = false
    }
  }
  return { state, enter: () => run(false), authorize: () => run(true), cancel }
}
