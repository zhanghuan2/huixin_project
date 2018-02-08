/**
 * 通用的工具方法
 */

import Message from './message'
import Confirm from './confirm'

(() => {
  $.extend(window.ZCY = window.ZCY || {},
    {Message},
    {Confirm}
  )
})()
