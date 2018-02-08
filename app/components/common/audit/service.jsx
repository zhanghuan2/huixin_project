

module.exports = {

  /**
   * 查询提交意见
   *
   * @param {String} url
   * @param {Object} params
   * @returns
   * {
   *   id
   *   userId
   *   userName
   *   createdAt
   *   content
   * }
   * @returns
   */
  queryOpinions (url, params) {
    if (!url) {
      return $.Deferred().resolve([])
    }
    return $.ajax({
      type: 'GET',
      url: url,
      data: params,
      contentType: 'application/json'
    })
    .then((data) => {
      return data && data.success && data.result || []
    })
  },

  /**
   * 添加提交意见
   *
   * @param {String} url
   * @param {Object} data
   * @returns
   */
  addOpinion (url, text) {
    if (!url || !text) {
      return $.Deferred().resolve([])
    }
    return $.ajax({
      type: 'POST',
      url: url,
      data: {
        "module":"commission",
        "flow":"commission-protocol",
        "advice":text
      }
    })
  },

  /**
   * 删除提交意见
   *
   * @param {any} id
   */
  delOpinion (url, id) {
    if (!url || !id) {
      return $.Deferred().resolve([])
    }
    return $.ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json',
      data: JSON.stringify({id})
    })
  },

  /**
   * 查询下一步的动作
   */
  queryNextStep (url, params) {
    if (!url) {
      return $.Deferred().resolve([])
    }
    return $.ajax({
      type: 'GET',
      url: url,
      data: params,
      contentType: 'application/json'
    })
  }
}
