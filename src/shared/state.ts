import type { StateKey, StateTypes } from './types'
import { getStorage, setStorage, clearAllStorage } from './storage'
import './highlight.css'

/* ---- 内部工具 ---- */

/** 生成随机 IPv4 地址 */
function randomIP(): string {
  const seg = () => Math.floor(Math.random() * 256)
  return `${seg()}.${seg()}.${seg()}.${seg()}`
}

/* ---- 默认值 ---- */

const DEFAULTS: StateTypes = {
  pw_a: false,
  pw_b: false,
  pw_c: false,
  pw_d: false,
  pw_e: false,
  pw_f: false,
  edit_log_visited: false,
  bz2_visited: false,
  completed: false,
  ip: randomIP(),
  path_log: [],
  search_history: [],
}

/* ---- 通用读写 ---- */

/**
 * 获取状态值（首次访问时写入默认值并返回）
 */
export function getState<K extends StateKey>(key: K): StateTypes[K] {
  const stored = getStorage<StateTypes[K]>(key)
  if (stored !== null) return stored

  // 首次访问：初始化默认值并持久化
  let def: StateTypes[K]
  if (key === 'ip') {
    // IP 只在首次访问时生成，之后固定
    def = randomIP() as StateTypes[K]
  } else {
    def = structuredClone(DEFAULTS[key])
  }
  setStorage(key, def)
  return def
}

/**
 * 写入状态值
 */
export function setState<K extends StateKey>(key: K, val: StateTypes[K]): void {
  setStorage(key, val)
}

/* ---- 便捷方法 ---- */

/** 解锁密码（写入 true） */
export function unlock(key: 'pw_a' | 'pw_b' | 'pw_c' | 'pw_d' | 'pw_e' | 'pw_f'): void {
  setState(key, true as any)
}

/** 检查密码是否已解锁 */
export function isUnlocked(key: 'pw_a' | 'pw_b' | 'pw_c' | 'pw_d' | 'pw_e' | 'pw_f'): boolean {
  return getState(key) as boolean
}

/** 追加访问日志（带真实时间戳） */
export function addPathLog(entry: string): void {
  const now = new Date()
  const ts = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0')
  const log = getState('path_log')
  log.push(ts + ' — ' + entry)
  setState('path_log', log)
}

/** 追加搜索历史（去重，新记录置顶） */
export function addSearchHistory(term: string): void {
  const history = getState('search_history')
  const filtered = history.filter(h => h !== term)
  filtered.unshift(term)
  setState('search_history', filtered)
}

/** 删除某条搜索历史 */
export function removeSearchHistory(term: string): void {
  const history = getState('search_history')
  setState('search_history', history.filter(h => h !== term))
}

/** 重置所有游戏状态（开发调试 / 重新开始） */
export function resetAllState(): void {
  clearAllStorage()
}
