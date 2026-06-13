/** 密码标识 A-F */
export type PasswordId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

/** 全局状态键（不含 nf_ 前缀） */
export type StateKey =
  | 'pw_a' | 'pw_b' | 'pw_c' | 'pw_d' | 'pw_e' | 'pw_f'
  | 'edit_log_visited' | 'bz2_visited' | 'bh_visited' | 'completed'
  | 'ip' | 'path_log' | 'search_history'

/** 各状态键对应的值类型 */
export interface StateTypes {
  pw_a: boolean
  pw_b: boolean
  pw_c: boolean
  pw_d: boolean
  pw_e: boolean
  pw_f: boolean
  edit_log_visited: boolean
  bz2_visited: boolean
  bh_visited: boolean
  completed: boolean
  ip: string
  path_log: string[]
  search_history: string[]
}

/** localStorage 条目内部格式 */
export interface StorageEntry<T> {
  v: T
  t: number
  c: string
}

/** 搜索结果类型 */
export type SearchResultType = 'trigger' | 'normal' | 'none'

export interface SearchResult {
  type: SearchResultType
  label: string
  route?: string
}

/** 页面守卫结果 */
export interface GuardResult {
  allowed: boolean
  action?: 'redirect-home' | 'show-404' | 'redirect-blindzone' | 'show-blank-404'
}
