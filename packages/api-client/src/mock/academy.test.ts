import { describe, expect, it } from 'vitest'
import type { AcademyOperations } from '../academy'
import { createMockSnapshot, createMockStore, executeMock, type MockRequestOptions } from './index'

function fixture() {
  const store = createMockStore({
    async load() {
      return undefined
    },
    async save() {},
  })
  const options: MockRequestOptions = {
    phase: 'p1',
    now: '2026-09-22T08:00:00.000Z',
    randomId: () => `random-${++sequence}`,
  }
  let sequence = 0
  async function call<K extends keyof AcademyOperations>(
    operation: K,
    input: AcademyOperations[K]['input'],
    token?: string,
  ) {
    return (await store.transaction('test', state =>
      executeMock(state, operation, input, { ...options, token }),
    )) as AcademyOperations[K]['output']
  }
  async function login(phone = '18800000001') {
    const challenge = await call('auth/challenge', { phone })
    return call('auth/login', {
      phone,
      challengeId: challenge.id,
      code: challenge.demoCode,
      agreed: true,
    })
  }
  return { store, options, call, login }
}

describe('账号与内容契约', () => {
  it('错误验证码持久计次，五次后失效，60 秒重发，挑战只能消费一次', async () => {
    const { call, options } = fixture()
    const phone = '18800000001'
    const challenge = await call('auth/challenge', { phone })
    await expect(call('auth/challenge', { phone })).rejects.toThrow('倒计时')
    for (let i = 0; i < 5; i++)
      await expect(
        call('auth/login', { phone, challengeId: challenge.id, code: '000000', agreed: true }),
      ).rejects.toThrow('验证码错误')
    await expect(
      call('auth/login', {
        phone,
        challengeId: challenge.id,
        code: challenge.demoCode,
        agreed: true,
      }),
    ).rejects.toThrow('失效')
    options.now = '2026-09-22T08:01:00.000Z'
    const next = await call('auth/challenge', { phone })
    const payload = { phone, challengeId: next.id, code: next.demoCode, agreed: true }
    await call('auth/login', payload)
    await expect(call('auth/login', payload)).rejects.toThrow('失效')
  })
  it('新账号不预建灵跃、不发积分；空昵称老用户不再引导', async () => {
    const { call, login, store } = fixture()
    const session = await login('18800000009')
    expect(session.isNew).toBe(true)
    expect(session.user.name).toBe('')
    expect(session.user.nicknamePrompted).toBe(true)
    const updated = await call(
      'account/profile',
      { nickname: '  小老师 ', avatar: 'ball' },
      session.token,
    )
    expect(updated.name).toBe('小老师')
    await expect(
      call('account/profile', { nickname: 'a b', avatar: 'ball' }, session.token),
    ).rejects.toThrow('昵称')
    expect((await call('account/me', {}, session.token)).name).toBe('小老师')
    expect((await login('18800000005')).isNew).toBe(false)
    expect(await store.transaction('test', state => state.batches.length)).toBe(0)
    expect(
      await store.transaction('test', state =>
        state.lingyue.some(item => item.userId === session.user.id),
      ),
    ).toBe(false)
  })
  it('会话以服务端记录为准，角色、用户和过期 token 无法越权', async () => {
    const { call, login, options } = fixture()
    const user = await login()
    await expect(call('review/list', {}, user.token)).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(call('account/me', {}, 'forged')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    options.now = '2026-09-29T08:00:00.000Z'
    await expect(call('account/me', {}, user.token)).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
  it('显式互动状态幂等，用户隔离，计数不受栏目筛选影响', async () => {
    const { call, login } = fixture()
    const first = await login()
    const second = await login('18800000005')
    await call('interaction/set', { id: '1', kind: 'like', active: true }, first.token)
    const stats = await call(
      'interaction/set',
      { id: '1', kind: 'like', active: true },
      first.token,
    )
    expect(stats.likes).toBe(1)
    expect((await call('interaction/list', { kind: 'like' }, second.token)).total).toBe(0)
    const filtered = await call(
      'interaction/list',
      { kind: 'favorite', channel: 'school' },
      first.token,
    )
    expect(filtered.total).toBe(0)
    expect(filtered.totals.favorite).toBe(1)
    await call('interaction/set', { id: '1', kind: 'like', active: false }, first.token)
    expect((await call('content/detail', { id: '1' })).stats.likes).toBe(0)
  })
  it('详情查询不计浏览，事件重试只加一次，失效和外链不提供互动详情', async () => {
    const { call } = fixture()
    const original = await call('content/detail', { id: '1' })
    await call('content/detail', { id: '1' })
    const a = await call('content/view', { id: '1', eventId: 'visit-1' })
    const b = await call('content/view', { id: '1', eventId: 'visit-1' })
    expect(a.views).toBe(original.stats.views + 1)
    expect(b.views).toBe(a.views)
    await expect(call('content/view', { id: '2', eventId: 'visit-1' })).rejects.toThrow()
    await expect(call('content/detail', { id: '48' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(call('content/detail', { id: '31' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
  it('推荐同分类优先、同分稳定、排除自己和下架', async () => {
    const { call } = fixture()
    const detail = await call('content/detail', { id: '1' })
    expect(detail.recommendations).toHaveLength(3)
    expect(
      detail.recommendations.every(
        item =>
          item.category === detail.content.category &&
          item.id !== '1' &&
          item.status === 'published',
      ),
    ).toBe(true)
    expect((await call('content/detail', { id: '1' })).recommendations).toEqual(
      detail.recommendations,
    )
  })
  it('P0 所有 P1 契约失败关闭，未知操作不返回模拟成功', async () => {
    const { call, login, options, store } = fixture()
    const session = await login('18800000004')
    options.phase = 'p0'
    for (const operation of [
      'work/list',
      'review/list',
      'points/account',
      'admin/taxonomies',
    ] as const) {
      await expect(call(operation, {}, session.token)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    }
    await call('lingyue/enter', { authorize: true }, session.token)
    expect(await store.transaction('test', state => state.batches)).toEqual([])
    await expect(
      executeMock(createMockSnapshot(), 'unknown/path', {}, options),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('投稿、审核、积分与运营事务', () => {
  it('拒绝后重新提交、审核发布、丢响应重试只发布并奖励一次', async () => {
    const { call, login, store } = fixture()
    const teacher = await login()
    const reviewer = await login('18800000002')
    const rejected = await call(
      'review/decide',
      { id: 'work-seed-2', version: 1, approved: false, reason: '补充过程', requestId: 'reject' },
      reviewer.token,
    )
    const submitted = await call(
      'work/submit',
      { id: rejected.id, version: rejected.version, requestId: 'resubmit' },
      teacher.token,
    )
    await store.transaction('test', state => {
      state.faults.push({
        operation: 'review/decide',
        kind: 'lost-response',
        status: 503,
        delayMs: 0,
        remaining: 1,
      })
    })
    const input = {
      id: submitted.id,
      version: submitted.version,
      approved: true,
      reason: '',
      requestId: 'approve',
    }
    await expect(call('review/decide', input, reviewer.token)).rejects.toThrow('响应丢失')
    const published = await call('review/decide', input, reviewer.token)
    expect(published.status).toBe('published')
    expect(
      await store.transaction(
        'test',
        state => state.contents.filter(item => item.sourceWorkId === submitted.id).length,
      ),
    ).toBe(1)
    expect(
      await store.transaction(
        'test',
        state => state.batches.filter(item => item.source === `work:${submitted.id}`).length,
      ),
    ).toBe(1)
    expect((await call('content/detail', { id: published.contentId! })).content.sourceWorkId).toBe(
      submitted.id,
    )
  })
  it('两人同时审核只有首个版本生效，运营角色不能审核', async () => {
    const { call, login } = fixture()
    const reviewer = await login('18800000002')
    const admin = await login('18800000004')
    const operator = await login('18800000003')
    const input = { id: 'work-seed-2', version: 1, approved: true, reason: '', requestId: 'a' }
    await expect(call('review/decide', input, operator.token)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
    const results = await Promise.allSettled([
      call('review/decide', input, reviewer.token),
      call('review/decide', { ...input, requestId: 'b' }, admin.token),
    ])
    expect(results.filter(item => item.status === 'fulfilled')).toHaveLength(1)
  })
  it.each(['succeeded', 'failed', 'pending'] as const)(
    '兑换 %s：冻结、重查、并发和过期保持一致',
    async outcome => {
      const { call, login, store, options } = fixture()
      const teacher = await login('18800000005')
      await call('lingyue/enter', { authorize: true }, teacher.token)
      await store.transaction('test', state => {
        state.exchangeOutcome = outcome
        state.batches.push({
          id: 'batch-test',
          userId: teacher.user.id,
          source: 'test',
          amount: 100,
          remaining: 100,
          createdAt: options.now,
          expiresAt: '2026-09-22T08:00:03.000Z',
        })
      })
      const results = await Promise.allSettled([
        call('points/exchange', { amount: 100, requestId: 'exchange-a' }, teacher.token),
        call('points/exchange', { amount: 100, requestId: 'exchange-b' }, teacher.token),
      ])
      expect(results.filter(item => item.status === 'fulfilled')).toHaveLength(1)
      const original = await call(
        'points/exchange',
        { requestId: 'exchange-a', amount: 100 },
        teacher.token,
      )
      options.now = '2026-09-22T08:00:04.000Z'
      expect((await call('points/order', { id: original.id }, teacher.token)).status).toBe(outcome)
      const account = await call('points/account', {}, teacher.token)
      expect(account.available).toBe(0)
      expect(account.frozen).toBe(outcome === 'pending' ? 100 : 0)
      expect(account.orders).toHaveLength(1)
      expect(account.entries.filter(item => item.kind === 'spend')).toHaveLength(
        outcome === 'succeeded' ? 1 : 0,
      )
      expect(account.entries.filter(item => item.kind === 'expire')).toHaveLength(
        outcome === 'failed' ? 1 : 0,
      )
    },
  )
  it('下架同步过滤公开列表、首页、推荐和个人有效关系', async () => {
    const { call, login } = fixture()
    const teacher = await login()
    const operator = await login('18800000003')
    await call('admin/content/offline', { id: '1', reason: '来源复核' }, operator.token)
    expect((await call('content/list', {})).list.some(item => item.id === '1')).toBe(false)
    expect((await call('content/home', {})).featured.some(item => item.id === '1')).toBe(false)
    expect(
      (await call('interaction/list', { kind: 'favorite' }, teacher.token)).totals.favorite,
    ).toBe(0)
    await expect(call('content/detail', { id: '1' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
