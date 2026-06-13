/**
 * 路由工具 — 自动处理 base 路径前缀
 *
 * 在开发环境（base: '/'）下原样返回，
 * 在部署环境（base: '/VolDeNuit/'）下自动添加前缀。
 */

export function route(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.replace(/\/+$/, '')
  if (normalized === '') return path
  return normalized + path
}

export function openPage(path: string): void {
  window.open(route(path), '_blank')
}
