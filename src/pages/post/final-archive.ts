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

function showChoice(_section: HTMLElement): void {
  setState('completed', true)
  addPathLog('最终档案 → 进入抉择')
  window.open('/ending/choice.html', '_blank')
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入最终档案')

  // 密码D守卫：未解锁则弹出密码输入框
  const pwD = getState('pw_d')
  if (!pwD) {
    showPasswordGuard()
    initSearch()
    window.scrollTo(0, 0)
    return
  }

  initSearch()
  initFlow()
  window.scrollTo(0, 0)
}

async function showPasswordGuard(): Promise<void> {
  const overlay = document.getElementById('password-overlay')
  if (!overlay) return
  overlay.classList.remove('hidden')

  const input = document.getElementById('password-input') as HTMLInputElement
  const error = document.getElementById('password-error')!
  const prompt = document.getElementById('password-prompt')!

  prompt.textContent = '此页面需要密码才能访问'
  error.textContent = '密码错误'
  error.classList.add('hidden')
  input.value = ''
  input.focus()

  const { checkPassword } = await import('../../shared/auth')

  async function verify(): Promise<void> {
    const ok = await checkPassword('D', input.value)
    if (ok) {
      overlay.classList.add('hidden')
      setState('pw_d', true)
      addPathLog('密码D验证成功 → 最终档案')
      initFlow()
    } else {
      error.textContent = '密码错误。提示：拼合邮箱地址'
      error.classList.remove('hidden')
      input.value = ''
      input.focus()
    }
  }

  const confirmBtn = document.getElementById('password-confirm')!
  const cancelBtn = document.getElementById('password-cancel')!
  const newConfirm = confirmBtn.cloneNode(true) as HTMLButtonElement
  const newCancel = cancelBtn.cloneNode(true) as HTMLButtonElement
  confirmBtn.parentNode!.replaceChild(newConfirm, confirmBtn)
  cancelBtn.parentNode!.replaceChild(newCancel, cancelBtn)

  newConfirm.addEventListener('click', verify)
  newCancel.addEventListener('click', () => overlay.classList.add('hidden'))
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') verify() })
}

document.addEventListener('DOMContentLoaded', init)
