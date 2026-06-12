/**
 * 结局二：保持沉默 — 页面㉚
 * 逐句出现 → 确定 → 三句依次淡入淡出
 */

import { addPathLog } from '../../shared/state'

const LINES = [
  '你关掉了页面，清空了浏览记录。',
  '不是不敢。',
  '而是你手里只有十年前的旧数据，而那个人可能真的还在。',
  '第二天，你再打开那个链接——',
  '论坛已经无法访问了。',
  '所有页面返回 404。',
  '就好像它从来没有存在过。',
]

const END_LINES = [
  { text: '有些门，进去了就出不来的。', gold: true, ending: false },
  { text: '夜航，「 第三航次 」，已结束。', gold: false, ending: true },
  { text: '「 第四航次 」，会在你准备好面对的时候开始。', gold: false, ending: true },
]

let currentLine = 0
let endIdx = 0
const container = document.getElementById('lines-container')!
const actionArea = document.getElementById('action-area')!
const triggerBtn = document.getElementById('trigger-btn')!

function showNextLine(): void {
  if (currentLine < LINES.length) {
    const p = document.createElement('p')
    p.className = 'line-item'
    p.textContent = LINES[currentLine]
    container.appendChild(p)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => p.classList.add('visible'))
    })
    currentLine++
    if (currentLine < LINES.length) {
      setTimeout(showNextLine, 2000)
    } else {
      setTimeout(() => {
        actionArea.classList.remove('hidden')
        requestAnimationFrame(() => actionArea.classList.add('visible'))
      }, 1000)
    }
  }
}

function showEndLine(): void {
  if (endIdx >= END_LINES.length) return

  const data = END_LINES[endIdx]
  const p = document.createElement('p')
  p.className = 'line-item'
  if (data.gold) p.classList.add('line-gold')
  if (data.ending) p.classList.add('line-ending')
  p.textContent = data.text
  container.appendChild(p)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => p.classList.add('visible'))
  })

  endIdx++

  if (endIdx >= END_LINES.length) {
    // 最后一条留在屏幕上
    return
  }

  // 停留 3 秒后淡出，再显示下一条
  setTimeout(() => {
    p.classList.remove('visible')
    setTimeout(() => {
      p.remove()
      setTimeout(() => showEndLine(), 400)
    }, 1000)
  }, 3000)
}

triggerBtn.addEventListener('click', () => {
  addPathLog('结局二 → 终幕')
  actionArea.classList.remove('visible')
  actionArea.classList.add('hidden')
  // 清掉前面的文字
  container.innerHTML = ''
  // 开始显示三句终幕
  setTimeout(showEndLine, 500)
})

function init(): void {
  addPathLog('进入结局二：保持沉默')
  setTimeout(showNextLine, 800)
}

document.addEventListener('DOMContentLoaded', init)
