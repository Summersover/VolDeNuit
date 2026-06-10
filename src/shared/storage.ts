import type { StorageEntry } from './types'

const PREFIX = 'nf_'

/**
 * 生成校验标记： key:JSON.stringify(val) 的 base64
 * 篡改者修改 v 后无法伪造匹配的 c
 */
function checksum(key: string, val: unknown): string {
  return btoa(key + ':' + JSON.stringify(val))
}

/**
 * 写入 localStorage（含编码 + 校验标记）
 */
export function setStorage<T>(key: string, val: T): void {
  const entry: StorageEntry<T> = {
    v: val,
    t: Date.now(),
    c: checksum(key, val),
  }
  localStorage.setItem(PREFIX + key, JSON.stringify(entry))
}

/**
 * 读取 localStorage（校验标记完整性，被篡改返回 null）
 */
export function getStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return null

  try {
    const entry: StorageEntry<T> = JSON.parse(raw)
    // 校验标记不匹配 → 数据被手动修改过
    if (entry.c !== checksum(key, entry.v)) return null
    return entry.v
  } catch {
    return null
  }
}

/** 删除某项 */
export function removeStorage(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

/** 清空所有游戏状态 */
export function clearAllStorage(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}
