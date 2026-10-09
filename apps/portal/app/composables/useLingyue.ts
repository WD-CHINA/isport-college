export function useLingyue() {
  const auth = useAuthStore()
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

  async function run() {
    if (state.value.pending) return
    if (!auth.isLoggedIn) {
      auth.openLoginModal({ reason: 'lingyue', onSuccess: () => run() })
      return
    }
    state.value.open = true
    state.value.pending = true
    state.value.failed = false
    try {
      await academyUnavailable()
    } catch {
      state.value.failed = true
    } finally {
      state.value.pending = false
    }
  }

  return { state, enter: run, authorize: run, cancel }
}
