/** 触屏浏览器可能延迟 :active；只维护视觉按压状态，不阻止点击或页面滚动。 */
export default defineNuxtPlugin(nuxtApp => {
  const selector =
    'a[href], button, input[type="button"], input[type="submit"], summary, [role="button"], [role="tab"]'
  let pressed: HTMLElement | null = null
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let startedAt = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function clear() {
    clearTimeout(timer)
    timer = undefined
    pressed?.removeAttribute('data-ic-pressed')
    pressed = null
    pointerId = null
  }

  function press(event: PointerEvent) {
    if (event.pointerType === 'mouse') return
    clear()
    if (!event.isPrimary || !(event.target instanceof Element)) return
    const control = event.target.closest(selector)
    if (
      !(control instanceof HTMLElement) ||
      control.closest(
        ':disabled, [aria-disabled="true"], [inert], .ant-btn-disabled, .ant-btn-loading, [aria-busy="true"], .ant-pagination-disabled',
      )
    )
      return
    pressed = control
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    startedAt = performance.now()
    control.setAttribute('data-ic-pressed', '')
  }

  function move(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) clear()
  }

  function release(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    // 快速轻点也能看见反馈；长按松手立即恢复，滑动和取消不保留反馈。
    const remaining = Math.max(0, 120 - (performance.now() - startedAt))
    if (remaining) timer = setTimeout(clear, remaining)
    else clear()
  }

  const options = { capture: true, passive: true }
  document.addEventListener('pointerdown', press, options)
  document.addEventListener('pointermove', move, options)
  document.addEventListener('pointerup', release, options)
  document.addEventListener('pointercancel', clear, options)
  document.addEventListener('scroll', clear, options)
  document.addEventListener('contextmenu', clear, options)
  document.addEventListener('visibilitychange', clear)
  window.addEventListener('blur', clear)

  function dispose() {
    clear()
    document.removeEventListener('pointerdown', press, true)
    document.removeEventListener('pointermove', move, true)
    document.removeEventListener('pointerup', release, true)
    document.removeEventListener('pointercancel', clear, true)
    document.removeEventListener('scroll', clear, true)
    document.removeEventListener('contextmenu', clear, true)
    document.removeEventListener('visibilitychange', clear)
    window.removeEventListener('blur', clear)
  }
  nuxtApp.vueApp.onUnmount(dispose)
  if (import.meta.hot) import.meta.hot.dispose(dispose)
})
