/**
 * Gambit 档案页 — 页面⑯
 * 夜航论坛 · 用户中心
 *
 * 包含：
 * - 文件一：私信记录（Gambit 与 隼 的站内私信）
 * - 文件二：自白信（Gambit 关于受胁迫监视隼的坦白）
 *
 * 与解谜链对齐：本页面为序号 ⑯，右下角显示 16/30
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import type { SearchResult } from '../../shared/types'

/* ============================================================
   搜索
   ============================================================ */

function initSearch(): void {
  const input = document.getElementById('search-input') as HTMLInputElement
  const btn = document.getElementById('search-btn') as HTMLButtonElement
  const panel = document.getElementById('search-panel')!
  const historyContainer = document.getElementById('history-list')!
  const resultContainer = document.getElementById('result-body')!
  const historySection = document.getElementById('search-history')!
  const resultSection = document.getElementById('search-result')!
  const clearBtn = document.getElementById('clear-history')!

  function renderHistory(): void {
    const history = getSearchHistory()
    if (history.length === 0) {
      historyContainer.innerHTML = '<li style="color:#4A5A6A;cursor:default;">暂无搜索记录</li>'
      return
    }
    historyContainer.innerHTML = history.map((h: string) =>
      `<li><span class="history-term">${escapeHtml(h)}</span></li>`
    ).join('')

    historyContainer.querySelectorAll('li').forEach((li, idx) => {
      li.addEventListener('click', () => {
        const term = history[idx]
        if (term) {
          input.value = term
          executeSearch(term)
        }
      })
    })
  }

  function executeSearch(query: string): void {
    const result: SearchResult = doSearch(query)

    panel.classList.remove('hidden')
    historySection.classList.add('hidden')
    resultSection.classList.remove('hidden')

    if (result.type === 'none') {
      resultContainer.innerHTML = '<span style="color:#4A5A6A;">未找到相关结果</span>'
      return
    }

    const typeLabel = result.type === 'trigger' ? '外部页面' : '站内'
    resultContainer.innerHTML = `
      <span class="result-label">${escapeHtml(result.label)}</span>
      <span class="result-type">[${typeLabel}]</span>
    `
    resultContainer.style.cursor = 'pointer'
    resultContainer.onclick = () => {
      if (result.route) {
        addPathLog(`搜索 → ${result.label}`)
        window.open(result.route, '_blank')
      }
    }
  }

  function doSearchQuery(): void {
    const query = input.value.trim()
    if (!query) return
    executeSearch(query)
    renderHistory()
  }

  btn.addEventListener('click', doSearchQuery)

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doSearchQuery()
    }
  })

  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') return
    historySection.classList.remove('hidden')
    resultSection.classList.add('hidden')
    renderHistory()
    panel.classList.remove('hidden')
  })

  input.addEventListener('input', () => {
    if (input.value.trim() !== '') panel.classList.add('hidden')
  })

  document.addEventListener('click', (e) => {
    const target = e.target as Node
    if (!panel.contains(target) && target !== input && target !== btn && !input.contains(target)) {
      panel.classList.add('hidden')
    }
  })

  clearBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const history = getSearchHistory()
    history.forEach((h: string) => removeSearchHistory(h))
    renderHistory()
  })
}

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  const path = window.location.pathname.replace(/\.html$/, '')

  if (path.endsWith('/user/gambit/archive')) {
    addPathLog('进入 Gambit 档案页')

    // 文件条目点击 → 新标签页打开
    const entryPm = document.getElementById('entry-pm')
    const entryConfession = document.getElementById('entry-confession')

    if (entryPm) {
      entryPm.addEventListener('click', () => {
        addPathLog('档案 → 私信记录')
        window.open('/user/gambit/pm', '_blank')
      })
    }
    if (entryConfession) {
      entryConfession.addEventListener('click', () => {
        addPathLog('档案 → 自白信')
        window.open('/user/gambit/confession', '_blank')
      })
    }
  } else if (path.endsWith('/user/gambit/pm')) {
    addPathLog('查看私信记录')
    // 返回档案列表
    const backBtn = document.getElementById('back-to-archive')
    if (backBtn) backBtn.addEventListener('click', () => window.open('/user/gambit/archive', '_blank'))
    const bcArchive = document.querySelector('.bc-archive')
    if (bcArchive) bcArchive.addEventListener('click', () => window.open('/user/gambit/archive', '_blank'))
  } else if (path.endsWith('/user/gambit/confession')) {
    addPathLog('查看恐吓信')
    // 返回档案列表
    const backBtn = document.getElementById('back-to-archive')
    if (backBtn) backBtn.addEventListener('click', () => window.open('/user/gambit/archive', '_blank'))
    const bcArchive = document.querySelector('.bc-archive')
    if (bcArchive) bcArchive.addEventListener('click', () => window.open('/user/gambit/archive', '_blank'))
  }

  initSearch()
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
