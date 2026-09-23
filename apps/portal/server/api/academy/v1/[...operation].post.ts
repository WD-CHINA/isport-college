import { executeMock } from '@isport/api-client/mock'
import { academyRequest, throwAcademyError } from '../../../utils/mock/request'
import { getMockStore } from '../../../utils/mock/storage'

export default defineEventHandler(async event => {
  try {
    const { namespace, config, options } = academyRequest(event)
    const operation = getRouterParam(event, 'operation') ?? ''
    if (Number(getHeader(event, 'content-length') || 0) > 1024 * 1024)
      throw createError({ statusCode: 413 })
    const body: unknown = await readBody(event)
    const data = await getMockStore(config.mock.storageDir).transaction(namespace, state =>
      executeMock(state, operation, body, options),
    )
    return { code: 200, data }
  } catch (error) {
    throwAcademyError(error)
  }
})
