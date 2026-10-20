import { useAcademy } from '~/composables/useAcademy'
import { useProfile } from '~/composables/useProfile'
import { useAuthStore } from '~/stores/auth'
import { useLoginUiStore } from '~/stores/login-ui'

export function useAccountProfile(onSaved: () => void) {
  const auth = useAuthStore()
  const loginUi = useLoginUiStore()
  const academy = useAcademy()
  const { pending, error, save, saveAvatar } = useProfile()
  const editing = shallowRef(false)
  const choosingAvatar = shallowRef(false)
  const avatarRequest = useAsyncData<number[]>(
    'academy:avatars',
    (_app, { signal }) => academy.avatars(undefined, signal),
    {
      server: false,
      immediate: false,
      default: () => [],
    },
  )
  watch(
    () => auth.revision,
    () => {
      editing.value = false
      choosingAvatar.value = false
    },
  )
  function startEditing() {
    if (pending.value) return
    choosingAvatar.value = false
    editing.value = true
  }
  function openAvatars() {
    if (pending.value) return
    editing.value = false
    choosingAvatar.value = true
    if (avatarRequest.status.value !== 'success') void avatarRequest.execute()
  }
  async function submit(value: { nickname: string }) {
    if (await save(value)) {
      editing.value = false
      onSaved()
    }
  }
  async function chooseAvatar(code: number) {
    if (!choosingAvatar.value || pending.value || !avatarRequest.data.value.includes(code)) return
    if (code === auth.user?.avatarCode) {
      choosingAvatar.value = false
      return
    }
    if (await saveAvatar(code)) {
      choosingAvatar.value = false
      onSaved()
    }
  }
  return {
    user: computed(() => auth.user),
    pending,
    error,
    editing,
    choosingAvatar,
    avatarRequest,
    startEditing,
    openAvatars,
    submit,
    chooseAvatar,
    logout: () => {
      loginUi.logoutConfirmVisible = true
    },
  }
}
