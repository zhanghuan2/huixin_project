module.exports = {
  saveChangeApi: params => $.ajax({
    spins: true,
    type: 'post',
    url: '/budget/api/purchase/budget/change/save',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(params)
  }),
  submitChangeApi: params => $.ajax({
    spins: true,
    type: 'post',
    url: '/health/api/hall/require/createRequirementHall',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(params)
  }),
  getCartList:(params) =>{
    return $.ajax({
      spins: true,
      type: 'GET',
      url: '/medical/cart/list',
      data:params
    })
  },
  deleteItem:(params) =>{
    return $.ajax({
      spins: true,
      type: 'POST',
      url: '/medical/cart/remove',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(params)
    })
  },
  changeAmout:(params) =>{
    return $.ajax({
      spins: true,
      type: 'POST',
      url: '/medical/cart/change',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(params)
    })
  },
  getRule:(params) =>{
    return $.ajax({
      spins: true,
      type: 'GET',
      contentType: 'application/json;charset=UTF-8',
      url: '/health/api/hall/rule/getRules'
    })
  }
};
