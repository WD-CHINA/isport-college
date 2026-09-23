import { requireMockControl, throwAcademyError } from '../../../utils/mock/request'
import { getMockStore } from '../../../utils/mock/storage'

export default defineEventHandler(async event => {
  try {
    const { namespace, config } = requireMockControl(event)
    const body = await readBody<Record<string, unknown>>(event)
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw createError({ statusCode: 400 })
    const store = getMockStore(config.mock.storageDir)
    if (body.action === 'reset') return await store.reset(namespace)
    return await store.transaction(namespace, state => {
      if (body.action === 'clock') {
        if (typeof body.now !== 'string' || !Number.isFinite(Date.parse(body.now)))
          throw createError({ statusCode: 400 })
        state.clock = new Date(body.now).toISOString()
      } else if (body.action === 'fault') {
        const kinds = ['error', 'empty', 'delay', 'timeout', 'lost-response'] as const
        const kind = kinds.find(value => value === body.kind)
        if (!kind || typeof body.operation !== 'string' || !/^[a-z/]+$/.test(body.operation))
          throw createError({ statusCode: 400 })
        const status =
          typeof body.status === 'number' && [400, 401, 403, 404, 503].includes(body.status)
            ? body.status
            : 503
        const delayMs =
          typeof body.delayMs === 'number' ? Math.max(0, Math.min(35000, body.delayMs)) : 100
        state.faults.push({ operation: body.operation, kind, remaining: 1, status, delayMs })
      } else if (body.action === 'exchange') {
        if (!['succeeded', 'failed', 'pending'].includes(String(body.result)))
          throw createError({ statusCode: 400 })
        state.exchangeOutcome = body.result as typeof state.exchangeOutcome
      } else if (body.action === 'precheck') {
        const work = state.works.find(item => item.id === body.id)
        if (
          !work ||
          !['pending', 'clear', 'duplicate', 'privacy', 'unsafe', 'failed'].includes(
            String(body.result),
          )
        )
          throw createError({ statusCode: 400 })
        work.precheck = body.result as typeof work.precheck
      } else {
        throw createError({ statusCode: 400, message: '不支持的控制操作' })
      }
      return { ok: true }
    })
  } catch (error) {
    throwAcademyError(error)
  }
})
