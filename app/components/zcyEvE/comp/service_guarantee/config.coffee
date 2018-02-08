Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "服务保障"
  @baseInfo.description = "服务保障"

  @configs.ext =
    name: "组件设置"

  consultTextProperty = new Properties.Property @,
    name: "consultText"
    label: "反馈咨询文案"
    description: "填写反馈咨询的标题文案"
    type: "text"
    useData: true

  consultHrefProperty = new Properties.Property @,
    name: "consultHref"
    label: "反馈咨询地址"
    description: "填写反馈咨询的链接地址"
    type: "text"
    useData: true

  serviceHrefProperty = new Properties.Property @,
    name: "serviceHref"
    label: "服务介绍地址"
    description: "填写服务介绍的链接地址"
    type: "text"
    useData: true

  @registerConfigProperty "ext", consultHrefProperty, serviceHrefProperty