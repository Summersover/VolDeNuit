/**
 * beacon_holder踩点帖 — extra3
 * 候机室 · 阳光新城周边随拍
 */

import '../../shared/state'
import { addPathLog } from '../../shared/state'

function init(): void {
  addPathLog('进入彩蛋页: beacon_holder踩点帖')
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
