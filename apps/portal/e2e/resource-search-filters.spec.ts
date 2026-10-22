import { expect, test, waitForHydration } from './academy.fixture'

const keywordFilters = {
  categoryList: [{ id: '3', name: '基本技能' }],
  secondCategoryList: [{ id: '70', name: '移动技能', parentId: '3' }],
  levelList: [{ id: '4', name: '水平四' }],
  bodyPartList: [],
  typeList: [{ id: '1', name: '音频' }],
}

test('关键词和分页 URL 服务端直出，水合及刷新不重复请求筛选项或列表', async ({ page }) => {
  const requests: string[] = []
  const hydrationErrors: string[] = []
  page.on('request', request => {
    if (/\/api\/v1\/resources(?:\/filters)?(?:\?|$)/.test(request.url()))
      requests.push(request.url())
  })
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) hydrationErrors.push(message.text())
  })
  const response = await page.goto(
    '/resources?keyword=分页样例&category=3&recommendedLevel=4&page=2',
  )
  expect(await response!.text()).toContain('分页样例 9')
  await waitForHydration(page)
  await expect(page.locator('.content-card').first()).toContainText('分页样例 9')
  await expect(page.getByRole('button', { name: '基本技能', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await waitForHydration(page)
  await expect(page.locator('.content-card').first()).toContainText('分页样例 9')
  expect(requests).toEqual([])
  expect(hydrationErrors).toEqual([])
})

for (const width of [1440, 390]) {
  test(`${width}px 搜索先清空旧筛选，等待关键词筛选项后再查询列表`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(
      '/resources?category=1&secondCategoryId=10&recommendedLevel=1&bodyPartTagId=4&resourceType=0&page=2',
    )
    await waitForHydration(page)
    const events: string[] = []
    const requests: URL[] = []
    let releaseFilters!: () => void
    const gate = new Promise<void>(resolve => {
      releaseFilters = resolve
    })
    await page.route(
      url => url.pathname === '/api/v1/resources/filters',
      async route => {
        const url = new URL(route.request().url())
        if (url.searchParams.get('keyword') !== '抢球游戏') return route.continue()
        events.push('filters:start')
        expect([...url.searchParams.keys()]).toEqual(['keyword'])
        await gate
        events.push('filters:ready')
        await route.fulfill({ json: { status: 200, message: 'OK', data: keywordFilters } })
      },
    )
    await page.route(
      url => url.pathname === '/api/v1/resources',
      async route => {
        const url = new URL(route.request().url())
        requests.push(url)
        events.push('resources')
        const sampleUrl = new URL(url)
        sampleUrl.searchParams.delete('keyword')
        const response = await route.fetch({ url: sampleUrl.href })
        const envelope = await response.json()
        envelope.data.list = [{ ...envelope.data.list[0], title: '抢球游戏', categoryCode: '3' }]
        envelope.data.total = 17
        await route.fulfill({ response, json: envelope })
      },
    )
    const hero = page.locator('.catalog-hero')
    await hero.getByRole('searchbox').fill('  抢球游戏  ')
    await hero.getByRole('button', { name: '搜索', exact: true }).click()
    await expect.poll(() => events).toEqual(['filters:start'])
    expect(requests).toHaveLength(0)
    expect([...new URL(page.url()).searchParams.entries()]).toEqual([['keyword', '抢球游戏']])
    releaseFilters()
    await expect(page.locator('.content-card')).toHaveCount(1)
    expect(events).toEqual(['filters:start', 'filters:ready', 'resources'])
    const first = requests[0]!.searchParams
    expect(first.get('keyword')).toBe('抢球游戏')
    expect(first.get('pageNum')).toBe('1')
    expect(first.get('firstCategoryId')).toBe('3')
    for (const field of ['secondCategoryId', 'recommendedLevel', 'bodyPartTagId', 'type'])
      expect(first.has(field)).toBe(false)
    await expect(page.locator('.content-filters__categories button')).toHaveText(['基本技能'])
    await expect(page.locator('.content-filters__categories [aria-pressed="true"]')).toHaveText([
      '基本技能',
    ])
    await expect(page).toHaveURL(/category=3&keyword=/)
    const level = page.getByRole('combobox', { name: /推荐水平/ })
    await level.click()
    const dropdown = page.locator('.ant-select-dropdown:visible')
    await expect(dropdown.locator('.ant-select-item-option-content')).toHaveText(['全部', '水平四'])
    await dropdown.getByText('水平四', { exact: true }).click()
    await expect.poll(() => requests.at(-1)?.searchParams.get('recommendedLevel')).toBe('4')
    await page.getByRole('button', { name: '页 2', exact: true }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect.poll(() => requests.at(-1)?.searchParams.get('pageNum')).toBe('2')
    expect(requests.at(-1)!.searchParams.get('keyword')).toBe('抢球游戏')
    expect(requests.at(-1)!.searchParams.get('firstCategoryId')).toBe('3')
    expect(requests.at(-1)!.searchParams.get('recommendedLevel')).toBe('4')
    expect(events).toEqual(
      Array.from({ length: 3 }, () => ['filters:start', 'filters:ready', 'resources']).flat(),
    )
    await hero.getByRole('button', { name: '清除搜索', exact: true }).click()
    await expect(page).toHaveURL('/resources?category=1')
    await expect(page.locator('.content-filters__categories button')).toHaveCount(4)
  })
}

test('筛选项失败时不请求列表，重试及重复搜索均按顺序重新加载', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  const events: string[] = []
  let failing = true
  await page.route(
    url => url.pathname === '/api/v1/resources/filters',
    async route => {
      events.push('filters')
      await route.fulfill(
        failing
          ? { status: 503, json: { status: 503, message: '暂时不可用', data: null } }
          : { json: { status: 200, message: 'OK', data: keywordFilters } },
      )
    },
  )
  await page.route(
    url => url.pathname === '/api/v1/resources',
    async route => {
      events.push('resources')
      const url = new URL(route.request().url())
      url.searchParams.delete('keyword')
      await route.fulfill({ response: await route.fetch({ url: url.href }) })
    },
  )
  const hero = page.locator('.catalog-hero')
  await hero.getByRole('searchbox').fill('抢球游戏')
  await hero.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible()
  expect(events).toEqual(['filters'])
  failing = false
  await page.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await expect(page.locator('.content-card')).toHaveCount(8)
  expect(events).toEqual(['filters', 'filters', 'resources'])
  await hero.getByRole('button', { name: '搜索', exact: true }).click()
  await expect
    .poll(() => events)
    .toEqual(['filters', 'filters', 'resources', 'filters', 'resources'])
})

test('搜索结果分类切换时保留关键词，并按新分类从第一页筛选', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await page.route(
    url => url.pathname === '/api/v1/resources/filters',
    route =>
      route.fulfill({
        json: {
          status: 200,
          message: 'OK',
          data: {
            ...keywordFilters,
            categoryList: [
              { id: '3', name: '基本技能' },
              { id: '4', name: '健康教育' },
            ],
          },
        },
      }),
  )
  const requests: URL[] = []
  await page.route(
    url => url.pathname === '/api/v1/resources',
    async route => {
      const url = new URL(route.request().url())
      requests.push(url)
      const sample = new URL(url)
      sample.searchParams.delete('keyword')
      await route.fulfill({ response: await route.fetch({ url: sample.href }) })
    },
  )
  const hero = page.locator('.catalog-hero')
  await hero.getByRole('searchbox').fill('举')
  await hero.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page.locator('.content-filters__categories [aria-pressed="true"]')).toHaveText([
    '基本技能',
  ])
  await page.getByRole('button', { name: '页 2', exact: true }).click()
  await expect.poll(() => requests.at(-1)?.searchParams.get('pageNum')).toBe('2')
  await page.getByRole('button', { name: '健康教育', exact: true }).click()
  await expect.poll(() => requests.at(-1)?.searchParams.get('firstCategoryId')).toBe('4')
  expect(requests.at(-1)!.searchParams.get('pageNum')).toBe('1')
  expect(requests.at(-1)!.searchParams.get('keyword')).toBe('举')
  await expect(page.locator('.content-filters__categories [aria-pressed="true"]')).toHaveText([
    '健康教育',
  ])
})

test('关键词没有匹配筛选项和资源时，隐藏全部筛选与列表', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  const events: string[] = []
  await page.route(
    url => url.pathname === '/api/v1/resources/filters',
    async route => {
      events.push('filters')
      await route.fulfill({
        json: {
          status: 200,
          message: 'OK',
          data: {
            categoryList: [],
            secondCategoryList: [],
            levelList: [],
            bodyPartList: [],
            typeList: [],
          },
        },
      })
    },
  )
  await page.route(
    url => url.pathname === '/api/v1/resources',
    async route => {
      events.push('resources')
      const query = new URL(route.request().url()).searchParams
      expect(query.get('keyword')).toBe('不存在的资源')
      expect(query.has('firstCategoryId')).toBe(false)
      await route.fulfill({
        json: {
          status: 200,
          message: 'OK',
          data: {
            total: 0,
            pageNum: 1,
            pageSize: 8,
            list: [],
          },
        },
      })
    },
  )
  const hero = page.locator('.catalog-hero')
  await hero.getByRole('searchbox').fill('不存在的资源')
  await hero.getByRole('searchbox').press('Enter')
  await expect(page.locator('.content-list-feature__search-empty')).toBeVisible()
  await expect(page.locator('.content-filters')).toHaveCount(0)
  await expect(page.locator('.content-grid')).toHaveCount(0)
  expect(events).toEqual(['filters', 'resources'])
})

test('快速连续搜索不会使用上一关键词的筛选项或覆盖最新结果', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  let releaseFirst!: () => void
  const gate = new Promise<void>(resolve => {
    releaseFirst = resolve
  })
  let firstStarted = false
  const keywords: string[] = []
  await page.route(
    url => url.pathname === '/api/v1/resources/filters',
    async route => {
      const keyword = new URL(route.request().url()).searchParams.get('keyword')
      if (keyword === '第一次') {
        firstStarted = true
        await gate
      }
      await route.fulfill({
        json: {
          status: 200,
          message: 'OK',
          data: {
            ...keywordFilters,
            categoryList: [
              {
                id: keyword === '第一次' ? '2' : '3',
                name: keyword === '第一次' ? '专项运动' : '基本技能',
              },
            ],
          },
        },
      })
    },
  )
  await page.route(
    url => url.pathname === '/api/v1/resources',
    async route => {
      const url = new URL(route.request().url())
      const keyword = url.searchParams.get('keyword')!
      keywords.push(keyword)
      url.searchParams.delete('keyword')
      const response = await route.fetch({ url: url.href })
      const envelope = await response.json()
      envelope.data.list = [{ ...envelope.data.list[0], title: keyword }]
      envelope.data.total = 1
      await route.fulfill({ response, json: envelope })
    },
  )
  const hero = page.locator('.catalog-hero')
  await hero.getByRole('searchbox').fill('第一次')
  await hero.getByRole('button', { name: '搜索', exact: true }).click()
  await expect.poll(() => firstStarted).toBe(true)
  await hero.getByRole('searchbox').fill('第二次')
  await hero.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page.locator('.content-card')).toHaveText([/第二次/])
  releaseFirst()
  await page.unrouteAll({ behavior: 'wait' })
  expect(keywords).toEqual(['第二次'])
  await expect(page.locator('.content-filters__categories button')).toHaveText(['基本技能'])
  await expect(page.locator('.content-card')).toHaveText([/第二次/])
})
