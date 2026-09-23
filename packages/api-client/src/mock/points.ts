import { MOCK_RULES } from '@isport/mock-data'
import type { ExchangeOrder, PointEntry } from '@isport/shared'
import { ApiError } from '../errors'
import { nextId, numeric, once, requireP1, requireUser, text, type MockContext } from './context'

function entry(
  ctx: MockContext,
  userId: string,
  kind: PointEntry['kind'],
  amount: number,
  source: string,
) {
  ctx.state.entries.push({
    id: nextId(ctx, 'entry'),
    userId,
    kind,
    amount,
    source,
    createdAt: ctx.now,
  })
}

export function reward(ctx: MockContext, userId: string, source: string, amount: number): void {
  if (
    ctx.phase !== 'p1' ||
    ctx.state.batches.some(item => item.userId === userId && item.source === source)
  )
    return
  ctx.state.batches.push({
    id: nextId(ctx, 'batch'),
    userId,
    source,
    amount,
    remaining: amount,
    createdAt: ctx.now,
    expiresAt: new Date(Date.parse(ctx.now) + MOCK_RULES.pointTtlDays * 86400000).toISOString(),
  })
  entry(ctx, userId, 'reward', amount, source)
}

function expire(ctx: MockContext, userId: string) {
  for (const batch of ctx.state.batches.filter(item => item.userId === userId)) {
    if (Date.parse(batch.expiresAt) <= Date.parse(ctx.now) && batch.remaining > 0) {
      entry(ctx, userId, 'expire', -batch.remaining, batch.id)
      batch.remaining = 0
    }
  }
}

function available(ctx: MockContext, userId: string) {
  return ctx.state.batches
    .filter(item => item.userId === userId)
    .reduce((sum, item) => sum + item.remaining, 0)
}

function settle(ctx: MockContext, order: ExchangeOrder) {
  if (
    order.status !== 'pending' ||
    ctx.state.exchangeOutcome === 'pending' ||
    Date.parse(ctx.now) - Date.parse(order.createdAt) < 1000
  )
    return
  order.status = ctx.state.exchangeOutcome
  order.updatedAt = ctx.now
  if (order.status === 'succeeded') {
    entry(ctx, order.userId, 'spend', -order.amount, order.id)
  } else {
    for (const allocation of order.allocations) {
      const batch = ctx.state.batches.find(item => item.id === allocation.batchId)!
      batch.remaining += allocation.amount
    }
    entry(ctx, order.userId, 'release', order.amount, order.id)
    expire(ctx, order.userId)
  }
}

export function handlePoints(
  ctx: MockContext,
  operation: string,
  input: Record<string, unknown>,
): unknown {
  if (!operation.startsWith('points/')) return undefined
  requireP1(ctx)
  const user = requireUser(ctx)
  for (const work of ctx.state.works.filter(item => item.userId === user.id && item.contentId)) {
    reward(ctx, user.id, `work:${work.id}`, MOCK_RULES.reward[work.kind])
  }
  if (user.teacher && Object.values(user.teacher).every(value => value.trim()))
    reward(ctx, user.id, 'profile', MOCK_RULES.profileReward)
  expire(ctx, user.id)
  if (operation === 'points/account') {
    const orders = ctx.state.exchanges.filter(item => item.userId === user.id)
    orders.forEach(order => settle(ctx, order))
    return {
      available: available(ctx, user.id),
      frozen: orders
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + item.amount, 0),
      entries: ctx.state.entries
        .filter(item => item.userId === user.id)
        .slice()
        .reverse(),
      batches: ctx.state.batches.filter(item => item.userId === user.id),
      orders: orders.slice().reverse(),
    }
  }
  if (operation === 'points/exchange') {
    return once(ctx, operation, input, () => {
      const amount = numeric(input, 'amount')
      if (!(MOCK_RULES.exchangeTiers as readonly number[]).includes(amount))
        throw ApiError.validation('兑换档位无效')
      if (!ctx.state.lingyue.some(item => item.userId === user.id && item.linked))
        throw ApiError.validation('请先关联灵跃账号')
      if (available(ctx, user.id) < amount) throw ApiError.validation('可用积分不足')
      const order: ExchangeOrder = {
        id: nextId(ctx, 'exchange'),
        userId: user.id,
        amount,
        status: 'pending',
        allocations: [],
        createdAt: ctx.now,
        updatedAt: ctx.now,
      }
      let remaining = amount
      for (const batch of ctx.state.batches
        .filter(item => item.userId === user.id)
        .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))) {
        const used = Math.min(batch.remaining, remaining)
        if (used) {
          batch.remaining -= used
          remaining -= used
          order.allocations.push({ batchId: batch.id, amount: used })
        }
        if (!remaining) break
      }
      ctx.state.exchanges.push(order)
      entry(ctx, user.id, 'freeze', -amount, order.id)
      return order
    })
  }
  if (operation === 'points/order') {
    const order = ctx.state.exchanges.find(
      item => item.id === text(input, 'id') && item.userId === user.id,
    )
    if (!order) throw ApiError.notFound()
    settle(ctx, order)
    return order
  }
  return undefined
}
