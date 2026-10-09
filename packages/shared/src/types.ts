/** 通用分页查询参数，与未来 API 约定保持一致 */
export interface PageQuery {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 通用分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 账号角色。前台资料接口不返回角色，管理端能力默认关闭。 */
export type Role = 'user' | 'admin' | 'reviewer' | 'operator'
