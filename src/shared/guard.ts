import type { GuardResult } from './types'
import { getState } from './state'

/**
 * 页面访问守卫（Section 9.3）
 *
 * 即使玩家通过 URL 直接跳转访问受保护页面，
 * 也会因状态缺失而被拦截，且不暴露"有受保护页面存在"。
 *
 * 调用方式（在各页面入口）：
 *   const { allowed, action } = checkAccess(window.location.pathname)
 *   if (!allowed) { 执行 action }
 */
export function checkAccess(path: string): GuardResult {
  const pathname = path.replace(/\/+$/, '').replace(/\.html$/, '') || '/'

  const rules: Record<string, () => GuardResult> = {
    '/edit-log/cellar': () => ({
      allowed: getState('pw_a'),
      action: 'redirect-home',
    }),

    '/user/beacon_holder': () => ({
      allowed: getState('pw_c'),
      action: 'show-404',
    }),

    '/user/gambit': () => ({
      allowed: getState('pw_c'),
      action: 'show-404',
    }),

    '/user/gambit/archive': () => ({
      allowed: getState('pw_c'),
      action: 'show-404',
    }),

    '/user/vega': () => ({
      allowed: getState('pw_c'),
      action: 'show-404',
    }),

    '/blindzone/entry/1': () => ({
      allowed: getState('pw_e'),
      action: 'redirect-blindzone',
    }),

    '/blindzone/entry/2': () => ({
      allowed: getState('pw_f'),
      action: 'redirect-blindzone',
    }),

    '/post/final-archive': () => ({
      allowed: getState('pw_d'),
      action: 'show-blank-404',
    }),
    '/final-archive': () => ({
      allowed: getState('pw_d'),
      action: 'show-blank-404',
    }),

    '/ending/disclose': () => ({
      allowed: getState('completed'),
      action: 'redirect-home',
    }),

    '/ending/silence': () => ({
      allowed: getState('completed'),
      action: 'redirect-home',
    }),
  }

  const rule = rules[pathname]
  if (!rule) return { allowed: true }

  return rule()
}
