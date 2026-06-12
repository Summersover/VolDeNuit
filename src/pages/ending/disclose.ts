/**
 * 结局一：公之于众 — 页面㉙
 * 逐句出现留屏 → 确定按钮 → 报纸 → …… → 终幕
 */

import { addPathLog } from '../../shared/state'

const LINES = [
  '你复制了所有证据，尽可能发给了媒体、警方和网络上。',
  '然后，你合上电脑。',
  '等天亮。',
  '「灯火暗去的那一刻，是那幢房子停止向世界召唤的时刻。」',
  '次日，你家中有人敲门。',
  '居然送来一份报纸——可家里从来没订过报纸。',
]

let currentLine = 0
const container = document.getElementById('lines-container')!
const actionArea = document.getElementById('action-area')!
const showBtn = document.getElementById('show-newspaper-btn')!
const newspaperSection = document.getElementById('newspaper-section')!
const nextDots = document.getElementById('np-next-btn')!
const endingSection = document.getElementById('ending-section')!

function showNextLine(): void {
  if (currentLine < LINES.length) {
    const p = document.createElement('p')
    p.className = 'line-item'
    p.textContent = LINES[currentLine]
    if (currentLine === 3) p.classList.add('line-gold')
    container.appendChild(p)
    // 确保初始渲染后再触发过渡
    requestAnimationFrame(() => {
      requestAnimationFrame(() => p.classList.add('visible'))
    })
    currentLine++

    if (currentLine < LINES.length) {
      setTimeout(showNextLine, 2000)
    } else {
      // 最后一句 → 显示确定按钮
      setTimeout(() => {
        actionArea.classList.remove('hidden')
        requestAnimationFrame(() => actionArea.classList.add('visible'))
      }, 1000)
    }
  }
}

// 确定 → 收起文字，显示报纸
showBtn.addEventListener('click', () => {
  addPathLog('结局一 → 查看报纸')
  actionArea.classList.remove('visible')
  actionArea.classList.add('hidden')
  container.style.display = 'none'
  newspaperSection.classList.remove('hidden')
  requestAnimationFrame(() => newspaperSection.classList.add('visible'))
})

// …… → 收起报纸，显示终幕
nextDots.addEventListener('click', () => {
  addPathLog('结局一 → 终幕')
  newspaperSection.classList.remove('visible')
  setTimeout(() => {
    newspaperSection.classList.add('hidden')
    endingSection.classList.remove('hidden')
    requestAnimationFrame(() => endingSection.classList.add('visible'))
  }, 800)
})

function init(): void {
  addPathLog('进入结局一：公之于众')
  setTimeout(showNextLine, 800)
}

document.addEventListener('DOMContentLoaded', init)
