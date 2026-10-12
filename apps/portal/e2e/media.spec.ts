import { expect, test, waitForHydration } from './academy.fixture'

test('推荐服务失败不影响 SSR 正文，HTML 脚本被过滤', async ({ page }) => {
  const response = await page.goto('/resources/8')
  expect(response?.status()).toBe(200)
  expect(await response!.text()).toContain('这是可独立加载的教学正文')
  await expect(page.getByRole('heading', { name: '资源示例 8', exact: true })).toBeVisible()
  await expect(page.locator('.content-detail__recommendations')).toHaveCount(0)
  await expect(page.locator('article script')).toHaveCount(0)
})
for (const [id, kind] of [
  [2, 'video'],
  [3, 'audio'],
] as const) {
  test(`${kind} 媒体加载并可调整播放速度`, async ({ page }) => {
    await page.goto(`/resources/${id}`)
    await waitForHydration(page)
    const player = page.locator(kind)
    await expect(player).toBeVisible()
    await expect
      .poll(() => player.evaluate((element: HTMLMediaElement) => element.readyState))
      .toBeGreaterThan(0)
    await page.locator('.media-preview__speed select').selectOption('1.5')
    expect(await player.evaluate((element: HTMLMediaElement) => element.playbackRate)).toBe(1.5)
  })
}
test('PDF 可渲染和缩放', async ({ page }) => {
  await page.goto('/resources/4')
  await waitForHydration(page)
  const canvas = page.locator('.pdf-preview canvas')
  await expect(canvas).toBeVisible()
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width))
    .toBeGreaterThan(300)
  await page.getByRole('button', { name: '放大', exact: true }).click()
  await expect(page.locator('.pdf-preview output')).toContainText('125%')
})
test('图片展开降级与 Esc 退出', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error('unsupported'))
  })
  await page.goto('/resources/5')
  await waitForHydration(page)
  await expect
    .poll(() =>
      page
        .locator('.media-preview__image')
        .evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: '全屏查看', exact: true }).click()
  await expect(page.locator('.preview-frame--expanded')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.preview-frame--expanded')).toHaveCount(0)
})
test('PPT 使用明确占位，失效媒体可重试', async ({ page }) => {
  await page.goto('/resources/6')
  await expect(page.locator('.media-preview__placeholder')).toContainText('PPT')
  await page.goto('/resources/9')
  await waitForHydration(page)
  await expect(page.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible()
  await page.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await expect(page.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible()
})
