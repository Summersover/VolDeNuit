/**
 * 阳光新城新闻 — 页面⑫
 * 外部线索页面 · 仿本地新闻网站
 *
 * 功能：路径追踪
 * 与解谜链对齐：本页面为序号 ⑫，右下角显示 12/30。
 */

import { addPathLog } from '../../shared/state'

function init(): void {
  addPathLog('进入外部页面: 阳光新城命案新闻')
}

document.addEventListener('DOMContentLoaded', init)
