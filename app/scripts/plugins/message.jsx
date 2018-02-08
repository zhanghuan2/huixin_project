
/**
 * 获取消息的class
 *
 * @param {any} type
 * @returns
 */
function getMessageIconClass (type) {
  switch (type) {
    case 'success':
      return 'icon-shuruzhengquetishi'
    case 'waring':
      return 'icon-shurujinggaotishi'
    case 'error':
      return 'icon-shurucuowutishi2'
    default:
      return 'icon-shuruzhengquetishi'
  }
}

function getMessageTpl (type, content) {
  return `<div class="zcy-message-notice">
    <div class="zcy-message-notice-content">
      <div class="zcy-message-content zcy-message-${type}">
        <i class="icon-zcy ${getMessageIconClass(type)}"></i>
        <span>${content}</span>
      </div>
    </div>
  </div>`
}

function showMessage (content, type = 'success', onClose = $.noop, duration = '3000') {
  // 没有content，不处理
  if (!content) {
    return
  }
  let $message = $(getMessageTpl(type, content))
  $('.zcy-message').prepend($message)
  $message.fadeIn(500, 'swing')

  setTimeout(() => {
    $message.fadeOut(500, 'swing', () => {
      $message.remove()
      onClose({success: true})
    })
  }, duration)
}

export default {
  success: (content, onClose, duration) => {
    showMessage(content, 'success', onClose, duration)
  },
  warning: (content, onClose, duration) => {
    showMessage(content, 'waring', onClose, duration)
  },
  error: (content, onClose, duration) => {
    showMessage(content, 'error', onClose, duration)
  }
}
