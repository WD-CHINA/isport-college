import { api, expect, test } from './academy.fixture'

test('详情 SSR 不计浏览，客户端展示与刷新各计一次，错误栏目和失效内容返回 404', async ({
  page,
  context,
}) => {
  const before = await api(context, 'content/detail', { id: '4' })
  const response = await context.request.get('/en/resources/4')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Loading PDF reader')
  expect((await api(context, 'content/detail', { id: '4' })).stats.views).toBe(before.stats.views)
  await page.goto('/resources/4')
  await expect(page.getByTestId('view-count')).toHaveText(`${before.stats.views + 1} 次浏览`)
  await expect(page.getByText('第 1 / 3 页', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(page.getByText('第 2 / 3 页', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '放大', exact: true }).click()
  await expect(page.locator('output')).toHaveText('125%')
  await page.getByRole('spinbutton', { name: '页码', exact: true }).fill('3')
  await page.getByRole('spinbutton', { name: '页码', exact: true }).press('Enter')
  await page.getByRole('spinbutton', { name: '页码', exact: true }).blur()
  await expect(page.getByText('第 3 / 3 页', { exact: true })).toBeVisible()
  await expect(page.locator('.pdf-preview__page')).toHaveAttribute('aria-busy', 'false')
  expect(
    await page
      .locator('canvas')
      .evaluate(
        (canvas: HTMLCanvasElement) =>
          canvas.width > 0 && canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data[3] === 255,
      ),
  ).toBe(true)
  expect((await api(context, 'content/detail', { id: '4' })).stats.views).toBe(
    before.stats.views + 1,
  )
  await page.reload()
  await expect(page.getByTestId('view-count')).toHaveText(`${before.stats.views + 2} 次浏览`)
  for (const path of [
    '/resources/48',
    '/schools/48',
    '/resources/32',
    '/research/31',
    '/resources/missing',
  ])
    expect((await context.request.get(path)).status()).toBe(404)
})

test('真实视频音频播放、倍速和暂停，图片无播放控件且全屏受限可退出', async ({ page }) => {
  await page.goto('/resources/1')
  await expect(page.locator('video')).toBeVisible()
  await page.locator('video').evaluate(async (video: HTMLVideoElement) => {
    video.muted = true
    await video.play()
  })
  await expect
    .poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime))
    .toBeGreaterThan(0)
  await page.getByRole('combobox', { name: '播放速度' }).selectOption('1.5')
  expect(
    await page.locator('video').evaluate((video: HTMLVideoElement) => video.playbackRate),
  ).toBe(1.5)
  await page.locator('video').evaluate((video: HTMLVideoElement) => video.pause())
  await page.goto('/resources/3')
  await page.locator('audio').evaluate(async (audio: HTMLAudioElement) => {
    audio.muted = true
    await audio.play()
  })
  await expect(page.locator('.media-preview__wave')).toHaveClass(/--playing/)
  await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.pause())
  await expect(page.locator('.media-preview__wave')).not.toHaveClass(/--playing/)
  await page.goto('/resources/2')
  await expect(page.locator('.media-preview__image')).toBeVisible()
  expect(
    await page
      .locator('.media-preview__image')
      .evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0)
  await expect(page.locator('video, audio')).toHaveCount(0)
  await page.evaluate(() => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: undefined,
    })
  })
  await page.getByRole('button', { name: '全屏查看' }).click()
  await expect(page.getByRole('dialog')).toContainText('页面内放大')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test('PDF 解析失败、图片缺失可重试，PPT 仅占位', async ({ page }) => {
  await page.route('**/media/sample.pdf', route =>
    route.fulfill({ contentType: 'application/pdf', body: 'invalid pdf' }),
  )
  await page.goto('/resources/4')
  await expect(page.getByText('PDF 加载或解析失败，请检查文件后重试。')).toBeVisible()
  await page.unroute('**/media/sample.pdf')
  await page.getByRole('button', { name: /^重\s*试$/ }).click()
  await expect(page.getByText('第 1 / 3 页', { exact: true })).toBeVisible()
  await page.route('**/media/sample.png', route => route.abort())
  await page.goto('/resources/2')
  await expect(page.getByText('媒体加载失败，文件可能缺失或格式不受支持。')).toBeVisible()
  await page.unroute('**/media/sample.png')
  await page.getByRole('button', { name: /^重\s*试$/ }).click()
  await expect(page.locator('.media-preview__image')).toBeVisible()
  await page.goto('/resources/5')
  await expect(page.getByText(/暂不支持 PPT 预览/)).toBeVisible()
  await expect(page.locator('canvas, video, audio')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '下一页' })).toHaveCount(0)
})

test('图文目录来自正文，学校栏目正确，手机英文详情不横向溢出', async ({ page }) => {
  await page.goto('/schools/43')
  const toc = page.getByRole('navigation', { name: '目录', exact: true })
  await expect(toc.getByRole('link')).toHaveCount(2)
  const href = await toc.getByRole('link').first().getAttribute('href')
  await toc.getByRole('link').first().click()
  expect(new URL(page.url()).hash).toBe(href)
  await expect(page.getByRole('navigation', { name: '当前位置' })).toContainText('学校案例')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/resources/4')
  await expect(page.getByText('Page 1 / 3', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('浏览上报响应丢失重试不重复计数', async ({ page, context }) => {
  const before = await api(context, 'content/detail', { id: '2' })
  await context.request.post('/api/academy/mock/control', {
    headers: { 'x-mock-control-key': process.env.ACADEMY_TEST_CONTROL_KEY! },
    data: { action: 'fault', operation: 'content/view', kind: 'lost-response' },
  })
  await page.goto('/resources/2')
  await expect(page.getByText('浏览统计暂未确认，可安全重试，不会重复计数。')).toBeVisible()
  await page.getByRole('button', { name: /^重\s*试$/ }).click()
  await expect(page.getByTestId('view-count')).toHaveText(`${before.stats.views + 1} 次浏览`)
  expect((await api(context, 'content/detail', { id: '2' })).stats.views).toBe(
    before.stats.views + 1,
  )
})
