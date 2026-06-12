/**
 * 最终档案 — 页面㉘
 * 夜航论坛 · 盲区
 * "霄汉的最后一封信"
 *
 * 功能：阅读信件→右下角通知→站内信→日志→渐暗→抉择
 * 与解谜链对齐：本页面为序号 ㉘，右下角显示 28/30。
 */

import '../../shared/state'
import { addPathLog, getState, setState } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import { addSearchHistory, removeSearchHistory } from '../../shared/state'
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
        if (term) { input.value = term; executeSearch(term) }
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
      <span class="result-type">[${typeLabel}]</span>`
    resultContainer.style.cursor = 'pointer'
    resultContainer.onclick = () => {
      if (result.route) { addPathLog(`搜索 → ${result.label}`); window.open(result.route, '_blank') }
    }
  }

  function doSearchQuery(): void {
    const query = input.value.trim()
    if (!query) return
    executeSearch(query)
    renderHistory()
  }

  btn.addEventListener('click', doSearchQuery)
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearchQuery() } })
  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') return
    historySection.classList.remove('hidden')
    resultSection.classList.add('hidden')
    renderHistory()
    panel.classList.remove('hidden')
  })
  input.addEventListener('input', () => { if (input.value.trim() !== '') panel.classList.add('hidden') })
  document.addEventListener('click', (e) => {
    const target = e.target as Node
    if (!panel.contains(target) && target !== input && target !== btn && !input.contains(target)) panel.classList.add('hidden')
  })
  clearBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation()
    getSearchHistory().forEach((h: string) => removeSearchHistory(h))
    renderHistory()
  })
}

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/* ============================================================
   交互流程
   ============================================================ */

function initFlow(): void {
  const toast = document.getElementById('dm-toast')!
  const toastViewBtn = document.getElementById('toast-view-btn')!
  const dmOverlay = document.getElementById('dm-overlay')!
  const dmCloseBtn = document.getElementById('dm-close-btn')!
  const logBar = document.getElementById('log-bar')!
  const logOverlay = document.getElementById('log-overlay')!
  const logCloseBtn = document.getElementById('log-close-btn')!
  const choiceSection = document.getElementById('choice-section')!

  // ① 监听滚动到底：等待5秒后显示右下角通知
  let toastShown = false
  let toastTimer: number | null = null

  function checkScroll(): void {
    if (toastShown) return
    const scrollBottom = window.innerHeight + window.scrollY
    const docHeight = document.documentElement.scrollHeight
    if (scrollBottom >= docHeight - 100) {
      toastShown = true
      window.removeEventListener('scroll', checkScroll)
      // 滚动到底后等5秒再弹通知
      toastTimer = window.setTimeout(() => {
        toast.classList.remove('hidden')
        addPathLog('最终档案 → 收到来自beacon_holder的站内信通知')
      }, 5000)
    }
  }

  window.addEventListener('scroll', checkScroll)

  // ② 点击"查看" → 打开站内信正文（居中弹窗）
  toastViewBtn.addEventListener('click', () => {
    toast.classList.add('hidden')
    dmOverlay.classList.remove('hidden')
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null }
  })

  // ③ 关闭站内信 → 显示日志标题栏
  dmCloseBtn.addEventListener('click', () => {
    dmOverlay.classList.add('hidden')
    logBar.classList.remove('hidden')
    logBar.style.animation = 'fadeIn 0.4s ease-out'
    addPathLog('最终档案 → 关闭站内信')
  })

  // ④ 点击日志标题栏 → 打开日志正文（居中弹窗）
  logBar.addEventListener('click', () => {
    renderMonitorLog()
    logOverlay.classList.remove('hidden')
  })

  // ⑤ 关闭日志 → 渐暗 → 显示抉择
  logCloseBtn.addEventListener('click', () => {
    logOverlay.classList.add('hidden')
    logBar.classList.add('hidden')
    showChoice(choiceSection)
  })
}

function renderMonitorLog(): void {
  const logContainer = document.getElementById('monitor-log')!
  const currentLine = document.getElementById('monitor-current')!

  const pathLog = getState('path_log')
  const ip = getState('ip')

  // 取最近的 20 条记录
  const recent = pathLog.slice(-20)

  const logLines = recent.map((entry: string) => {
    return `<div class="monitor-line">${escapeHtml(entry)}</div>`
  }).join('')

  logContainer.innerHTML = logLines

  const d = new Date()
  const ts = d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0') + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0') + ':' +
    String(d.getSeconds()).padStart(2, '0')
  currentLine.textContent = `${ts} — 新访客 IP ${ip} → 当前位置：最终档案`
}

function showChoice(section: HTMLElement): void {
  setState('completed', true)
  addPathLog('最终档案 → 进入抉择')

  // 创建全屏渐暗遮罩（5秒缓慢压暗）
  const fadeOverlay = document.createElement('div')
  fadeOverlay.id = 'fade-to-black'
  Object.assign(fadeOverlay.style, {
    position: 'fixed',
    inset: '0',
    background: '#000',
    zIndex: '9998',
    opacity: '0',
    transition: 'opacity 5s ease-out',
    pointerEvents: 'none',
  })
  document.body.appendChild(fadeOverlay)

  // 先压暗 container
  const container = document.getElementById('container')!
  container.style.transition = 'filter 5s ease-out, opacity 5s ease-out'
  container.style.filter = 'brightness(0.15) contrast(1.3)'

  // 触发渐暗
  requestAnimationFrame(() => {
    fadeOverlay.style.opacity = '1'
  })

  // 渐暗完成后显示抉择
  setTimeout(() => {
    container.style.filter = 'brightness(0)'
    container.style.opacity = '0'
    section.classList.remove('hidden')
    section.style.animation = 'fadeIn 1.2s ease-out'
  }, 5200)
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入最终档案')
  initSearch()
  initFlow()
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
