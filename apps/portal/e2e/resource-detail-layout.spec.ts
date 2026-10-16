import { expect, test, waitForHydration } from './academy.fixture'

test('资源图片详情使用独立预览、真实来源信息与图标互动', async ({ page }) => {
  const response = await page.goto('/preview/resource/resources/5')
  expect(await response!.text()).toContain('资源示例 5')
  await waitForHydration(page)
  await expect(page.locator('.resource-detail__information h1')).toHaveText('资源示例 5')
  await expect(page.locator('.resource-detail__publisher strong')).toHaveText('测试作者')
  await expect(page.getByTestId('view-count')).toContainText('11')
  await expect(page.locator('.resource-detail__report')).toBeDisabled()
  await expect(page.getByRole('button', { name: /^收藏/ })).toHaveCount(1)
  await expect(page.locator('.resource-detail__recommendations .content-card')).toHaveCount(3)
  await expect(
    page.locator('.resource-detail__recommendations .content-card__link').first(),
  ).toHaveAttribute('href', '/preview/article/resources/1')
})

test('图片缩略图、切换箭头、页码和键盘始终同步', async ({ page }) => {
  await page.goto('/preview/resource/resources/5')
  await waitForHydration(page)
  const gallery = page.getByTestId('image-carousel')
  const counter = gallery.getByRole('status')
  await expect(counter).toHaveText('1 / 3')
  await gallery.getByRole('button', { name: '查看第3张', exact: true }).click()
  await expect(counter).toHaveText('3 / 3')
  await expect(gallery.locator('.resource-gallery__image')).toHaveAttribute('src', /image=3$/)
  await gallery.getByRole('button', { name: '下一张', exact: true }).click()
  await expect(counter).toHaveText('1 / 3')
  await gallery.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(counter).toHaveText('3 / 3')
  await expect(gallery.getByRole('button', { name: '查看第3张', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(gallery.getByRole('button', { name: /全屏/ })).toHaveCount(0)
})

for (const width of [320, 768]) {
  test(`资源媒体与信息卡在 ${width}px 下不溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    for (const prefix of ['', '/en']) {
      for (const id of [2, 3, 4, 5]) {
        await page.goto(`${prefix}/preview/resource/resources/${id}`)
        await waitForHydration(page)
        await expect(page.locator('.resource-detail__information h1')).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
      }
    }
  })
}
