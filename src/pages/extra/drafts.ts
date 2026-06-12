/**
 * Vega未发送站内信 — extra4
 * 站内信草稿 · 从未发出
 */

import { addPathLog } from '../../shared/state'

function init(): void {
  addPathLog('进入彩蛋页: Vega未发送站内信')
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
