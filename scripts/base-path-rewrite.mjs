/**
 * 构建后处理脚本：将 built HTML 中所有页面内链改写为带 base 路径的格式
 * 例如 <a href="/board/tower"> → <a href="/VolDeNuit/board/tower">
 * 仅处理 HTML 中的 <a href>，不影响 Vite 已处理的资源路径
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const base = process.env.BASE_URL || '/VolDeNuit/'
const distDir = process.argv[2] || 'dist'

/** 已知的内部路由前缀列表 */
const ROUTE_PREFIXES = [
  '/board/', '/post/', '/user/', '/edit-log/', '/blindzone/',
  '/external/', '/ending/', '/flight-path/', '/saint-exupery/',
  '/farewell/', '/memoir/', '/statement/', '/final-archive',
]

function isRoutePath(path) {
  return ROUTE_PREFIXES.some(p => path.startsWith(p))
}

/** 给路径加上 base 前缀 */
function prefixPath(path) {
  return base.replace(/\/$/, '') + path
}

function rewriteHtml(filePath) {
  let html = readFileSync(filePath, 'utf-8')
  const original = html

  // <a href="/route/..."> → <a href="/VolDeNuit/route/...">
  html = html.replace(/(<a\s[^>]*?href\s*=\s*)"\//gi, (match, pre) => `${pre}"${base}`)

  // data-route="/route/..." → data-route="/VolDeNuit/route/..."
  html = html.replace(/(data-route\s*=\s*)"\//gi, (match, pre) => `${pre}"${base}`)

  // meta refresh: content="0;url=/route/..." → content="0;url=/VolDeNuit/route/..."
  html = html.replace(/(content=["']\d+;url\s*=\s*)\//gi, (match, pre) => `${pre}${base}`)

  // inline <script> window.location.replace('/route/...')
  html = html.replace(/window\.location\.(?:replace|href)\s*\(?\s*'(\/[^']+)'/g, (match, path) => {
    if (isRoutePath(path)) return match.replace(`'${path}'`, `'${prefixPath(path)}'`)
    return match
  })

  if (html !== original) {
    writeFileSync(filePath, html, 'utf-8')
    console.log(`  ✓ ${filePath.replace(/\\/g, '/')}`)
  }
}

function rewriteJs(filePath) {
  let code = readFileSync(filePath, 'utf-8')
  const original = code

  // 改写 window.open("/route/...", ...) 中的路径
  code = code.replace(/window\.open\("(\/[^"]+)"(\s*(?:,|\)))/g, (match, path, rest) => {
    if (isRoutePath(path)) return `window.open("${prefixPath(path)}"${rest}`
    return match
  })

  // 改写 window.location.href = '/route/...'
  code = code.replace(/window\.location\.href\s*=\s*'(\/[^']+)'/g, (match, path) => {
    if (isRoutePath(path)) return match.replace(`'${path}'`, `'${prefixPath(path)}'`)
    return match
  })

  // 改写字符串字面量中的路由路径（如 search.ts 中的 route: 定义）
  for (const prefix of ROUTE_PREFIXES) {
    const escaped = prefix.replace(/\//g, '\\/')
    const re = new RegExp(`"(${escaped}[^"]*)"`, 'g')
    code = code.replace(re, (match, path) => `"${prefixPath(path)}"`)
  }

  if (code !== original) {
    writeFileSync(filePath, code, 'utf-8')
    console.log(`  ✓ ${filePath.replace(/\\/g, '/')}`)
  }
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (extname(full) === '.html') rewriteHtml(full)
    else if (extname(full) === '.js') rewriteJs(full)
  }
}

console.log(`Rewriting HTML paths with base: ${base}`)
walk(distDir)
console.log('Done.')
