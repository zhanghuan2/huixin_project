###
  此文件为前端profile配置文件
  主要用于前端渲染模板配置和js配置
  基础格式
  properties:
    env: "develop"
    decription: "wtf"
    resource:
      user:
        name: 名字
    symbol:
      user:
        hasName: true
###
Language = require "locale/locale"

properties =
  env: "parana"
  description: "parana 配置"
  resource:
    activity:
      defaultStart: moment().add(-10, "y").format("YYYY-MM-DD HH:mm:ss")
      defaultEnd: moment().add(90, "y").format("YYYY-MM-DD HH:mm:ss")
      defaultBuyerScale: 5
      defaultItemScale: 1
      defaultDiscountType: "normal"
    address:
      tradeInfoLevel: 2
      shopProfileLevel: 2
      userProfileLevel: 2
      sellerReturnAddressLevel: 2
    item:
      skuMostDimension: 4
  symbol:
    validator:
      mobile: "^\\d{8,12}$"
    address:
      hasType: true
    defaultExpend: false
    logistics:
      showSource: false

module.exports = properties
