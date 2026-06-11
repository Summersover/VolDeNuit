/**
 * 地窖帖正文页 — 页面⑥
 * 夜航论坛 · 深空版块
 * "地窖"
 *
 * 功能：搜索栏交互、路径追踪、编辑记录密码A解锁
 * 密码A = "Vol de Nuit"（来自塔台创站公告）
 * 与解谜链对齐：本页面为序号 ⑥，右下角显示 6/30。
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
      historyContainer.innerHTML = '<li style="color:#666;cursor:default;">暂无搜索记录</li>'
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
      resultContainer.innerHTML = '<span style="color:#666;">未找到相关结果</span>'
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

  // Typing → hide panel immediately
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
   密码A — 编辑记录解锁
   密码 = "Vol de Nuit"（来自塔台创站公告）
   ============================================================ */

const PASSWORD_A = 'Vol de Nuit'

function initPasswordModal(): void {
  const editLink = document.getElementById('edit-link')
  const overlay = document.getElementById('password-overlay')!
  const input = document.getElementById('password-input') as HTMLInputElement
  const error = document.getElementById('password-error')!
  const confirmBtn = document.getElementById('password-confirm')!
  const cancelBtn = document.getElementById('password-cancel')!

  if (!editLink) return

  editLink.addEventListener('click', () => {
    overlay.classList.remove('hidden')
    input.value = ''
    error.classList.add('hidden')
    input.focus()
  })

  function validate(): void {
    const val = input.value.trim()
    if (val === PASSWORD_A) {
      addPathLog('密码A正确 → 进入编辑记录')
      window.location.href = '/edit-log/cellar'
    } else {
      error.classList.remove('hidden')
      input.select()
    }
  }

  confirmBtn.addEventListener('click', validate)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      validate()
    }
  })
  cancelBtn.addEventListener('click', () => {
    overlay.classList.add('hidden')
  })

  /* 点击遮罩层关闭 */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden')
  })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入地窖帖')
  initSearch()
  initPasswordModal()
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
