import type { Ref } from 'vue'

export function useExpandedPreview(target: Readonly<Ref<HTMLElement | null>>) {
  const fallback = shallowRef(false)
  const native = shallowRef(false)
  const expanded = computed(() => fallback.value || native.value)
  let previousFocus: HTMLElement | null = null
  let previousOverflow = ''
  let disposed = false
  let pending = false
  function leaveFallback() {
    if (!fallback.value) return
    fallback.value = false
    document.body.style.overflow = previousOverflow
    previousFocus?.focus()
  }
  async function toggle() {
    if (disposed || pending || !target.value) return
    if (fallback.value) return leaveFallback()
    if (document.fullscreenElement === target.value) {
      await document.exitFullscreen().catch(() => {})
      return
    }
    pending = true
    const element = target.value
    try {
      if (!element.requestFullscreen) throw new Error('FULLSCREEN_UNAVAILABLE')
      await element.requestFullscreen()
      if (disposed && document.fullscreenElement === element)
        await document.exitFullscreen().catch(() => {})
    } catch {
      if (disposed) return
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      fallback.value = true
      await nextTick()
      target.value?.focus()
    } finally {
      pending = false
    }
  }
  function changed() {
    native.value = Boolean(target.value && document.fullscreenElement === target.value)
  }
  function keydown(event: KeyboardEvent) {
    if (!fallback.value) return
    if (event.key === 'Escape') leaveFallback()
    if (event.key === 'Tab') {
      const focusable = target.value?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
      )
      const first = focusable?.[0]
      const last = focusable?.[focusable.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === target.value)
      ) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }
  onMounted(() => {
    document.addEventListener('fullscreenchange', changed)
    document.addEventListener('keydown', keydown)
  })
  onScopeDispose(() => {
    disposed = true
    if (import.meta.client) {
      leaveFallback()
      document.removeEventListener('fullscreenchange', changed)
      document.removeEventListener('keydown', keydown)
    }
  })
  return { expanded, fallback, toggle }
}
