/**
 * 月亮照片 - 页面⑪
 * 夜航论坛 · 候机室版块
 * "2015中秋晒月亮活动获奖作品"
 *
 * 功能：搜索栏交互、路径追踪、裁切照片点击查看、密码E线索
 * 与解谜链对齐：本页面为序号 ⑪，右下角显示 11/30。
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory, getState } from '../../shared/state'
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
   初始化
   ============================================================ */

function initPhotoClick(): void {
  const photoContainer = document.getElementById('moon-photo-cropped')
  if (!photoContainer) return
  if (photoContainer.classList.contains('can-click')) return // 已绑定，跳过

  const visitedEditLog = getState('edit_log_visited')
  if (visitedEditLog) {
    photoContainer.classList.add('can-click')
    photoContainer.addEventListener('click', () => {
      addPathLog('月亮照片 → 放大查看')
      document.getElementById('photo-viewer')!.classList.remove('hidden')
    })
  }
}

function init(): void {
  addPathLog('进入月亮照片帖')
  initSearch()

  initPhotoClick()

  // 跨标签页同步：当另一标签页中 edit_log_visited 变化时自动启用
  window.addEventListener('storage', (e) => {
    if (e.key === 'nf_edit_log_visited') initPhotoClick()
  })

  // 标签页切换回来时重新检查（用户可能在另一标签页解锁后切回来）
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) initPhotoClick()
  })

  // 查看器关闭
  const viewer = document.getElementById('photo-viewer')
  const closeBtn = document.getElementById('viewer-close-btn')
  const bg = document.getElementById('photo-viewer-bg')
  if (viewer && closeBtn) {
    closeBtn.addEventListener('click', () => viewer.classList.add('hidden'))
    if (bg) bg.addEventListener('click', () => viewer.classList.add('hidden'))
  }

  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
