import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import type { Ref } from 'vue'
import { isLocalMediaUrl } from '@isport/shared'

export function usePdfPreview(
  source: Readonly<Ref<string>>,
  canvas: Readonly<Ref<HTMLCanvasElement | null>>,
) {
  const documentProxy = shallowRef<PDFDocumentProxy | null>(null)
  const page = shallowRef(1)
  const scale = shallowRef(1)
  const loading = shallowRef(true)
  const rendering = shallowRef(false)
  const failed = shallowRef(false)
  const pages = computed(() => documentProxy.value?.numPages ?? 0)
  const ready = shallowRef(false)
  let loadingTask: PDFDocumentLoadingTask | undefined
  let renderTask: RenderTask | undefined
  let generation = 0
  let renderGeneration = 0
  let disposed = false

  async function draw() {
    const current = ++renderGeneration
    const previous = renderTask
    previous?.cancel()
    if (previous) await previous.promise.catch(() => {})
    if (current !== renderGeneration || disposed) return
    const pdf = documentProxy.value
    const target = canvas.value
    if (!pdf || !target || !ready.value) return
    rendering.value = true
    try {
      const pdfPage = await pdf.getPage(page.value)
      if (current !== renderGeneration || disposed) return
      const viewport = pdfPage.getViewport({ scale: scale.value })
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      target.width = Math.floor(viewport.width * ratio)
      target.height = Math.floor(viewport.height * ratio)
      target.style.width = `${viewport.width}px`
      target.style.height = `${viewport.height}px`
      renderTask = pdfPage.render({
        canvas: target,
        viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
      })
      await renderTask.promise
    } catch (error) {
      if (
        current === renderGeneration &&
        !disposed &&
        !(error instanceof Error && error.name === 'RenderingCancelledException')
      )
        failed.value = true
    } finally {
      if (current === renderGeneration) rendering.value = false
    }
  }

  async function load() {
    const current = ++generation
    ++renderGeneration
    renderTask?.cancel()
    documentProxy.value = null
    loading.value = true
    failed.value = false
    page.value = 1
    scale.value = 1
    const previous = loadingTask
    loadingTask = undefined
    await previous?.destroy().catch(() => {})
    try {
      if (!isLocalMediaUrl(source.value)) throw new Error('INVALID_PDF_SOURCE')
      const [pdfjs, worker] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ])
      if (current !== generation || disposed) return
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      loadingTask = pdfjs.getDocument({ url: source.value, enableXfa: false, stopAtErrors: true })
      const pdf = await loadingTask.promise
      if (current !== generation || disposed) return
      documentProxy.value = pdf
    } catch {
      if (current === generation && !disposed) failed.value = true
    } finally {
      if (current === generation && !disposed) loading.value = false
    }
  }

  function goTo(value: number) {
    if (Number.isFinite(value)) page.value = Math.max(1, Math.min(pages.value, Math.trunc(value)))
  }
  function zoom(value: number) {
    if (Number.isFinite(value)) scale.value = Math.max(0.5, Math.min(2, value))
  }
  watch([documentProxy, page, scale, canvas], () => void draw(), { flush: 'post' })
  watch(source, () => {
    if (ready.value) void load()
  })
  onMounted(() => {
    ready.value = true
    void load()
  })
  onScopeDispose(() => {
    disposed = true
    ++generation
    ++renderGeneration
    renderTask?.cancel()
    void loadingTask?.destroy().catch(() => {})
  })
  return { page, scale, pages, loading, rendering, failed, goTo, zoom, retry: load }
}
