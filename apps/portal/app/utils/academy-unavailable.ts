import { ApiError } from '~/api/errors'

/** 投稿、积分、灵跃和管理端写接口不在 C 端前台文档中。 */
export function academyUnavailable<T = never>(..._args: unknown[]): Promise<T> {
  return Promise.reject(ApiError.serviceUnavailable('该能力不在学苑前台接口中'))
}
