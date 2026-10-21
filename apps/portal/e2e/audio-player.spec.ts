import { expect, test, waitForHydration } from './academy.fixture'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

for (const [prefix, play, seek] of [
  ['', '播放', '播放进度'],
  ['/en', 'Play', 'Playback position'],
] as const) {
  test(`${prefix || '中文'} 音频 SSR 占位与水合一致，解码后启用控件`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/hydration/i.test(message.text())) errors.push(message.text())
    })
    const response = await page.goto(`${prefix}/preview/resource/resources/3`)
    const html = await response!.text()
    expect(html).toContain('ui-audio-player__wave')
    expect(html).not.toContain('ui-audio-player__waveform')
    expect(html).toContain('aria-busy="true"')
    await waitForHydration(page)
    const player = page.getByTestId('audio-preview')
    await expect(player.getByRole('button', { name: play, exact: true })).toBeEnabled()
    await expect(player.locator('canvas').first()).toBeVisible()
    await expect(player.locator('.ui-audio-player__time')).toHaveText('0:00 / 0:06')
    await expect(player.getByRole('slider', { name: seek, exact: true })).toBeEnabled()
    expect(errors).toEqual([])
  })
}

test('真实音频支持播放暂停、wavesurfer 波浪、独立进度条、键盘、音量和循环', async ({ page }) => {
  await page.goto('/preview/resource/resources/3')
  await waitForHydration(page)
  const player = page.getByTestId('audio-preview')
  const media = player.locator('audio')
  const play = player.getByRole('button', { name: '播放', exact: true })
  await expect(play).toBeEnabled()
  await play.click()
  await expect(player.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
  const wave = player.locator('.ui-audio-player__wave')
  const progress = wave.locator('[part="progress"]')
  await expect
    .poll(() => progress.evaluate(element => element.getBoundingClientRect().width))
    .toBeGreaterThan(0)
  await expect
    .poll(() => media.evaluate((audio: HTMLAudioElement) => audio.currentTime))
    .toBeGreaterThan(0)
  await player.getByRole('button', { name: '暂停', exact: true }).click()
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
  const pausedTime = await media.evaluate((audio: HTMLAudioElement) => audio.currentTime)
  const waveWidth = (await wave.boundingBox())!.width
  await expect
    .poll(() => progress.evaluate(element => element.getBoundingClientRect().width))
    .toBeCloseTo((waveWidth * pausedTime) / 6, 0)
  const seek = player.getByRole('slider', { name: '播放进度', exact: true })
  await expect(seek).toHaveCSS('opacity', '1')
  await expect(player.locator('.ui-audio-player__controls canvas')).toHaveCount(0)
  const bounds = await seek.boundingBox()
  await seek.click({ position: { x: bounds!.width / 2, y: bounds!.height / 2 } })
  await expect
    .poll(() => media.evaluate((audio: HTMLAudioElement) => audio.currentTime))
    .toBeCloseTo(3, 0)
  await seek.focus()
  await seek.press('Home')
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBe(0)
  await expect(player.locator('.ui-audio-speed-select')).toHaveCount(0)
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.playbackRate)).toBe(1)
  await player.getByRole('button', { name: '静音', exact: true }).click()
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.muted)).toBe(true)
  await player.getByRole('button', { name: '取消静音', exact: true }).click()
  const volume = player.getByRole('slider', { name: '音量', exact: true })
  await volume.focus()
  await volume.press('Home')
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.volume)).toBe(0)
  await player.getByRole('button', { name: '取消静音', exact: true }).click()
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.volume)).toBe(1)
  await player.locator('summary').click()
  await player.getByRole('checkbox', { name: '循环播放', exact: true }).check()
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.loop)).toBe(true)
  await player.getByRole('button', { name: '从头播放', exact: true }).click()
  await expect.poll(() => media.evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBe(0)
})

test('音频加载失败有重试入口，恢复后重新解码且无未处理异常', async ({ page }) => {
  let fail = true
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/media/sample.wav', async route => {
    if (fail) await route.fulfill({ status: 503, body: '' })
    else await route.continue()
  })
  await page.goto('/preview/resource/resources/3')
  await waitForHydration(page)
  const player = page.getByTestId('audio-preview')
  await expect(player.getByRole('alert')).toContainText('媒体加载失败')
  await expect(player.getByRole('button', { name: '播放', exact: true })).toBeDisabled()
  fail = false
  await player.getByRole('button', { name: '重试', exact: true }).click()
  await expect(player.getByRole('button', { name: '播放', exact: true })).toBeEnabled()
  await expect(player.locator('canvas').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('离开音频预览后暂停并清理媒体源', async ({ page }) => {
  await page.goto('/preview/resource/resources/3')
  await waitForHydration(page)
  const player = page.getByTestId('audio-preview')
  const media = await player.locator('audio').elementHandle()
  await expect(player.getByRole('button', { name: '播放', exact: true })).toBeEnabled()
  await player.getByRole('button', { name: '播放', exact: true }).click()
  await page.locator('.app-header__nav a[href="/resources"]').click()
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  expect(
    await media!.evaluate((audio: HTMLAudioElement) => ({
      paused: audio.paused,
      src: audio.getAttribute('src'),
    })),
  ).toEqual({ paused: true, src: null })
})

test('音频播放器在 320px 至桌面布局下控件可用且无横向溢出', async ({ page }) => {
  for (const width of [320, 390, 994, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/preview/resource/resources/3')
    await waitForHydration(page)
    const player = page.getByTestId('audio-preview')
    await expect(player.getByRole('button', { name: '播放', exact: true })).toBeEnabled()
    await expect(player.getByRole('slider', { name: '音量', exact: true })).toBeVisible()
    await expect(player.getByRole('combobox', { name: '播放速度', exact: true })).toHaveCount(0)
    await expect(player.locator('.ui-audio-player__wave canvas').first()).toBeVisible()
    await expect(player.locator('.ui-audio-player__wave')).toHaveCSS('height', '48px')
    await expect(player.getByRole('slider', { name: '播放进度', exact: true })).toBeVisible()
    await expect(player.getByRole('slider', { name: '播放进度', exact: true })).toHaveCSS(
      'opacity',
      '1',
    )
    await expect(
      player.locator('.ui-audio-player__stage, .ui-audio-player__waveform, .ui-audio-wave'),
    ).toHaveCount(0)
    expect((await player.boundingBox())!.height).toBeLessThan(240)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await player.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    if (width === 390 || width === 1440) {
      const dir = resolve('../../test-results/wavesurfer-audio-20261019')
      await mkdir(dir, { recursive: true })
      await player.screenshot({ path: resolve(dir, `audio-${width}.png`) })
    }
  }
})

test('减少动态设置下 wavesurfer 保留真实播放进度且不添加装饰动画', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/preview/resource/resources/3')
  await waitForHydration(page)
  const player = page.getByTestId('audio-preview')
  const play = player.getByRole('button', { name: '播放', exact: true })
  await expect(play).toBeEnabled()
  await play.click()
  const wave = player.locator('.ui-audio-player__wave')
  await expect
    .poll(() =>
      wave.locator('[part="progress"]').evaluate(element => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(0)
  expect(await wave.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0)
})
