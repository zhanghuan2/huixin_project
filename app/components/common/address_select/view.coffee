optionsTemplate = Handlebars.templates["common/address_select/templates/options"]

class Address
  constructor: ($)->
    @addressSelect = ".address-select"

  #初始化地址
  initAddress: ($container)=>
    provinceId = parseInt($(".address-select[data-level=1]").val())
    cityId = parseInt($(".address-select[data-level=2]").val())
    regionId = parseInt($(".address-select[data-level=3]").val())
    @selectAddress("", {ids: [provinceId, cityId, regionId], level: 1})
    $(".address-select", $container).on "change", @selectAddress

  #获取市列表
  selectAddress: (e, option)=>
    level = if option then option.level else $(e.currentTarget).data("level") + 1
    option = option || {level}
    parent = $(".address-select[data-level=#{level - 1}]")
    parentId = if parent.length then parent.val() else 0
    $(".address-select[data-level=#{level}]").spin("small")
    $.get "/api/address/#{parentId}/children", (data)=>
      $(".address-select[data-level=#{level}]").html(optionsTemplate({data}))
      $(".address-select[data-level=#{level}]").find("option[value=#{option.ids[level - 1]}]").prop("selected", true) if option.ids
      $(".address-select[data-level=#{level}]").selectric("refresh")
      $(".address-select[data-level=#{level}]").spin(false)
      option.level += 1
      @selectAddress("", option) if option.level <= @levels

  #提交地址
  submitAddress: (evt)->
    evt.preventDefault()
    userTradeInfo = $("#address-form").serializeObject()
    userTradeInfo.province = $(".address-select[data-level=1] option[value=#{userTradeInfo.provinceId}]:selected").text()
    userTradeInfo.city = $(".address-select[data-level=2] option[value=#{userTradeInfo.cityId}]:selected").text()
    userTradeInfo.region = $(".address-select[data-level=3] option[value=#{userTradeInfo.regionId}]:selected").text()
    if $("#addressId").length is 0 then type = "POST" else type = "PUT"
    $.ajax
      url: "/api/user/receiveAddress"
      type: type
      data: JSON.stringify(userTradeInfo)
      contentType: "application/json"
      success: (data)->
        window.location.reload()

module.exports = Address
