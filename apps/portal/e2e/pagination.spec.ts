import { expect, test, waitForHydration } from './academy.fixture'

test('左右跳页按钮反复挂载后，省略号仍有独立的图形内容', async ({ page }) => {
  await page.goto('/resources?keyword=分页样例&page=9')
  await waitForHydration(page)
  const pagination = page.locator('.app-pagination--catalog')
  const ellipses = pagination.locator('.ant-pagination-item-ellipsis')
  for (let round = 0; round < 3; round++) {
    await expect(ellipses, `第 ${round + 1} 轮左右省略号完整`).toHaveCount(2)
    for (const ellipsis of await ellipses.all()) {
      await expect(ellipsis.locator('svg')).toHaveCount(1)
      await expect(ellipsis.locator('svg path, svg circle')).not.toHaveCount(0)
    }
    await pagination.getByRole('button', { name: '页 1', exact: true }).click()
    await expect(page).not.toHaveURL(/page=/)
    await pagination.locator('.ant-pagination-jump-next').click()
    await expect(page).toHaveURL(/page=6/)
    await pagination.getByRole('button', { name: '页 7', exact: true }).click()
    await expect(page).toHaveURL(/page=7/)
    await pagination.getByRole('button', { name: '页 8', exact: true }).click()
    await expect(page).toHaveURL(/page=8/)
    await pagination.getByRole('button', { name: '页 9', exact: true }).click()
    await expect(page).toHaveURL(/page=9/)
  }
  await page.mouse.move(0, 0)
  await pagination.scrollIntoViewIfNeeded()
  await pagination.screenshot({ path: 'test-results/pagination-page9.png' })
})

for (const width of [390, 1440]) {
  test(`${width}px 目录分页省略号清晰可见，悬停切换箭头且前后跳页正常`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/resources?keyword=分页样例')
    await waitForHydration(page)
    const pagination = page.locator('.app-pagination--catalog')
    await pagination.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const color = await pagination.evaluate(element => getComputedStyle(element).color)
    const jumpNext = pagination.locator('.ant-pagination-jump-next')
    const nextEllipsis = jumpNext.locator('.ant-pagination-item-ellipsis')
    await expect(nextEllipsis).toBeVisible()
    await expect(nextEllipsis).toHaveCSS('opacity', '1')
    await expect(nextEllipsis).toHaveCSS('color', color)
    const step = Number((await jumpNext.getAttribute('aria-label'))?.match(/\d+/)?.[0])
    expect(step).toBeGreaterThan(0)

    await jumpNext.hover()
    await expect(nextEllipsis).toHaveCSS('opacity', '0')
    await expect(jumpNext.locator('.ant-pagination-item-link-icon')).toHaveCSS('opacity', '1')
    await jumpNext.click()
    await expect(page).toHaveURL(new RegExp(`page=${1 + step}(?:&|$)`))
    await expect(page.locator('.content-card').first()).not.toContainText('分页样例 1')

    await page.mouse.move(0, 0)
    const jumpPrev = pagination.locator('.ant-pagination-jump-prev')
    const prevEllipsis = jumpPrev.locator('.ant-pagination-item-ellipsis')
    await expect(prevEllipsis).toBeVisible()
    await expect(prevEllipsis).toHaveCSS('opacity', '1')
    await expect(prevEllipsis).toHaveCSS('color', color)
    await jumpPrev.hover()
    await expect(prevEllipsis).toHaveCSS('opacity', '0')
    await expect(jumpPrev.locator('.ant-pagination-item-link-icon')).toHaveCSS('opacity', '1')
    await jumpPrev.click()
    await expect.poll(() => new URL(page.url()).searchParams.get('page') ?? '1').toBe('1')
    await expect(page).toHaveURL(/keyword=/)
    await expect(page.locator('.content-card').first()).toContainText('分页样例 1')
  })
}
