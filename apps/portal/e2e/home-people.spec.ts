import { expect, test, waitForHydration, returnFromBackground } from './academy.fixture'
import type { Page } from '@playwright/test'
import type { Swiper } from 'swiper'

const story =
  '从学生的练习表现出发，关注参与程度、动作变化与学习反馈，分享课堂观察和评价的具体方法。\n'.repeat(
    30,
  )

async function preparePeople(page: Page) {
  await page.goto('/')
  await waitForHydration(page)
  await page.route('**/api/v1/home', async route => {
    const response = await route.fetch()
    const envelope = await response.json()
    const teacher = envelope.data.teacherList[0]
    envelope.data.teacherList = [1, 2, 3, 4, 5, 6].map(id => ({
      ...teacher,
      id,
      name: `名师${id}`,
      story: id === 6 ? '' : story,
    }))
    await route.fulfill({ response, json: envelope })
  })
  await returnFromBackground(page)
  await expect(page.locator('.home-people__card')).toHaveCount(6)
}

function autoplayRunning(page: Page) {
  return page
    .locator('.home-people swiper-container')
    .evaluate(element => (element as HTMLElement & { swiper: Swiper }).swiper.autoplay.running)
}

test('名师 story 鼠标移入后整卡深色覆盖，可滚动且移出恢复轮播', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await preparePeople(page)
  const card = page.locator('.home-people__card').first()
  await card.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect.poll(() => autoplayRunning(page)).toBe(true)
  const bounds = (await card.boundingBox())!
  await card.hover()
  const overlay = card.locator('.home-people__story')
  const body = overlay.locator('.home-people__story-body')
  await expect(overlay).toHaveCSS('opacity', '1')
  await expect(overlay).toHaveCSS('background-color', 'rgb(28, 31, 35)')
  await expect(body).toHaveText(story)
  const covered = (await overlay.boundingBox())!
  for (const key of ['x', 'y', 'width', 'height'] as const)
    expect(covered[key]).toBeCloseTo(bounds[key], 0)
  expect(await card.boundingBox()).toEqual(bounds)
  await expect.poll(() => autoplayRunning(page)).toBe(false)
  expect(await body.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  await body.hover()
  await page.mouse.wheel(0, 300)
  await expect.poll(() => body.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  await page.screenshot({ path: 'test-results/teacher-story-desktop.png' })
  await page.mouse.move(0, 0)
  await expect(overlay).toHaveCount(0)
  await expect.poll(() => autoplayRunning(page)).toBe(true)
})

test('名师 story 支持键盘打开及 Escape 关闭，空故事不添加交互', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await preparePeople(page)
  const card = page.locator('.home-people__card').first()
  const trigger = card.getByRole('button', { name: '名师1 · 查看故事', exact: true })
  await trigger.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  await trigger.focus()
  await trigger.press('Enter')
  await expect(card.locator('.home-people__story-body')).toHaveText(story)
  await expect(card.getByRole('button', { name: '关闭故事', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(card.locator('.home-people__story')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(
    page.locator('.home-people__card').last().locator('.home-people__story-trigger'),
  ).toHaveCount(0)
})

test('故事浮层展开后仍可用鼠标左右拖动名师轮播', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await preparePeople(page)
  const dots = page.locator('.home-people .home-swiper__dots button')
  for (const [index, direction, nextPage] of [
    [1, -1, 1],
    [4, 1, 0],
  ] as const) {
    const card = page.locator('.home-people__card').nth(index)
    await card.hover()
    const body = card.locator('.home-people__story-body')
    await expect(body).toBeVisible()
    const bounds = (await body.boundingBox())!
    const x = bounds.x + bounds.width / 2
    const y = bounds.y + bounds.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + direction * 320, y, { steps: 8 })
    await page.mouse.up()
    await expect(dots.nth(nextPage)).toHaveAttribute('aria-pressed', 'true')
  }
})

test.describe('手机故事浮层', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('手指横滑可切换卡片，浮层内竖滑可阅读长故事', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', '真实触摸手势通过 Chromium CDP 发送')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await preparePeople(page)
    const session = await page.context().newCDPSession(page)
    const dots = page.locator('.home-people .home-swiper__dots button')
    const swipe = async (x: number, y: number, dx: number, dy: number) => {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y }],
      })
      for (let step = 1; step <= 12; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x + (dx * step) / 12, y: y + (dy * step) / 12 }],
        })
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    const card = page.locator('.home-people__card').first()
    await card.scrollIntoViewIfNeeded()
    let bounds = (await card.boundingBox())!
    await swipe(bounds.x + bounds.width - 35, bounds.y + bounds.height / 2, -230, 0)
    await expect(dots.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.home-people__story')).toHaveCount(0)
    await dots.first().tap()
    await card.locator('.home-people__story-trigger').tap()
    const body = card.locator('.home-people__story-body')
    await expect(body).toBeVisible()
    bounds = (await body.boundingBox())!
    await swipe(bounds.x + bounds.width / 2, bounds.y + bounds.height - 20, 0, -100)
    await expect.poll(() => body.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    await expect(dots.first()).toHaveAttribute('aria-pressed', 'true')
    await swipe(bounds.x + bounds.width - 20, bounds.y + bounds.height / 2, -230, 0)
    await expect(dots.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await session.detach()
  })

  test('点击展开完整 story，关闭后恢复自动轮播且无横向溢出', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await preparePeople(page)
    const card = page.locator('.home-people__card').first()
    await card.locator('.home-people__story-trigger').tap()
    const overlay = card.locator('.home-people__story')
    await expect(overlay).toHaveCSS('opacity', '1')
    await expect(overlay.locator('.home-people__story-body')).toHaveText(story)
    await expect.poll(() => autoplayRunning(page)).toBe(false)
    await page.screenshot({ path: 'test-results/teacher-story-mobile.png' })
    const dots = page.locator('.home-people .home-swiper__dots button')
    await dots.nth(1).tap()
    await expect(overlay).toHaveCount(0)
    await expect.poll(() => autoplayRunning(page)).toBe(true)
    await dots.first().tap()
    await card.locator('.home-people__story-trigger').tap()
    await expect(overlay).toHaveCSS('opacity', '1')
    await overlay.getByRole('button', { name: '关闭故事', exact: true }).tap()
    await expect(overlay).toHaveCount(0)
    await expect.poll(() => autoplayRunning(page)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
})
