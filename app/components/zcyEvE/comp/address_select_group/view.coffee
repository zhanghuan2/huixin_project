###
  省市级联非下拉框模式
  author by terminus.io (zl)
###
addressItemTemplate = Handlebars.templates["common/address_select_group/templates/address_item"]

class Address
  constructor: (@level)->
    @$showAddress = $(".address-text")
    @provinceSelect = ".address-tab li[data-level=1]"
    @citySelect = ".address-tab li[data-level=2]"
    @regionSelect = ".address-tab li[data-level=3]"
    @streetSelect = ".address-tab li[data-level=4]"
    @addressList = ".address-content li"
    @showAddress = ".address-text"
    @levels = $(".address-group").data("levels")

  ###
    点击省市框弹出级联Ul
  ###
  popAddressSelect: (evt)=>
    $(".address-area").show()
    @initAddress()

  ###
    初始化地址
  ###
  initAddress: (callback)=>
    if !$(".address-text").data("city")
      $.ajax
        url: "/api/address/ip-info"
        type: "GET"
        success: (data)=>
          if data[0]
            _.each data, (i, index) ->
              $(".address-tab li[data-level=#{index + 1}]").data("default", i.id) if data.length > index
            $(".address-tab li[data-level=#{@levels}]").trigger("click")
            @provinceChange()
    else
      $(".address-tab li[data-level=#{@levels}]").trigger("click")
      @provinceChange()

  ###
    切换地址TAB
  ###
  addressTab: ->
    $(@).addClass("active").siblings().removeClass("active").parents(".address-area").find(".address-content").eq($(@).index()).show().siblings(".address-content").hide()
    $(".address-close").click ->
      $(".address-area").hide()

  ###
    地址切换
  ###
  addressChange: (evt)=>
    element = $(evt.currentTarget)
    level = element.closest(".address-content").data("level")
    element.addClass("active").siblings().removeClass("active")
    $(".address-tab li[data-level=#{level}]").find("a").text(element.text())
    if level is 1
      $(".address-content li").data({"province": element.data("value"), "provinceName": element.text()})
    else if level is 2
      $(".address-content li").data({"city": element.data("value"), "cityName": element.text()})
    else if level is 3
      $(".address-content li").data({"region": element.data("value"), "regionName": element.text()})
    else
      $(".address-content li").data({"street": element.data("value"), "streetName": element.text()})
    if element.parents(".address-content").data("level") is element.parents(".address-area").find(".address-content").length
      $(".address-area").hide()
      data = {
        province: $(".address-content[data-level=1] li.active").data("value")
        provinceName: $(".address-content[data-level=1] li.active").text()
        city: $(".address-content[data-level=2] li.active").data("value")
        cityName: $(".address-content[data-level=2] li.active").text()
        region: $(".address-content[data-level=3] li.active").data("value")
        regionName: $(".address-content[data-level=3] li.active").text()
        street: $(".address-content[data-level=4] li.active").data("value")
        streetName: $(".address-content[data-level=4] li.active").text()
      }
      $(".address-text").text((_.map $(".address-content"), (i) -> $("li.active", i).text()).join(" ")).data(data)
      $(".address-text").trigger('ZCYEvent.addressChange')
    $(".address-tab li[data-level=#{level + 1}]").trigger("click")
    @callback?()

  ###
    省/直辖市切换
    * @param 通过当前IP获取省市
  ###
  provinceChange: =>
    return if $(".address-content[data-level=1]").html()
    defaultValue = $(".address-tab li[data-level=1]").data("default")
    if defaultValue
      $(".address-content[data-level=1]").data("default", "")
    $.get "/api/address/0/children", (data)=>
      _.filter data, (i, index) ->
        if (!defaultValue and index is 0) or (defaultValue and defaultValue is i.id)
          $(".address-tab li[data-level=1] a").text(i.name)
      $(".address-content[data-level=1]").html(addressItemTemplate({data, defaultValue}))
      if @levels is 1
        $(".address-text").text((_.map $(".address-content"), (i) -> $("li.active", i).text()).join(" "))
        @callback?()
      else
        @cityChange({})

  ###
    市切换
    * @param 通过当前IP获取省市
  ###
  cityChange: (evt) =>
    element = $(evt.currentTarget)
    selectedId = element.data("selected") || ""
    provinceId = $(".address-content[data-level=1] li.active").data("value")
    return if !provinceId || selectedId.toString() is provinceId.toString()
    defaultValue = $(".address-tab li[data-level=2]").data("default")
    if defaultValue
      element.data("default", "")
    element.data("selected", provinceId)
    thatTab = $(".address-content[data-level=2]")
    $.get "/api/address/#{provinceId}/children", (data)=>
      _.filter data, (i, index) ->
        if (!defaultValue and index is 0) or (defaultValue and defaultValue is i.id)
          $(".address-tab li[data-level=2] a").text(i.name)
      thatTab.html(addressItemTemplate({data, defaultValue}))
      if !thatTab.find("li.active").length
        thatTab.find("li:first").addClass("active")
      $(".address-tab li[data-level=2] a").text(thatTab.find("li.active").text())
      if @levels is 2
        $(".address-text").text((_.map $(".address-content"), (i) -> $("li.active", i).text()).join(" "))
        @callback?()
      else
        @regionChange({})

  ###
    区县切换
  ###
  regionChange: (evt)=>
    element = $(evt.currentTarget)
    selectedId = element.data("selected") || ""
    cityId = $(".address-content[data-level=2] li.active").data("value")
    if !cityId || selectedId.toString() is cityId.toString()
      return
    defaultValue = $(".address-tab li[data-level=3]").data("default")
    if defaultValue
      element.data("default", "")
    element.data("selected", cityId)
    thatTab = $(".address-content[data-level=3]")
    $.get "/api/address/#{cityId}/children", (data)=>
      #澳门特别行政区只有两级，需要特殊处理
      if (!data || data.length == 0)
        $(".address-tab li[data-level=3]").hide()
        thatTab.empty()
        $(".address-area").hide()
        addrData = {
          province: $(".address-content[data-level=1] li.active").data("value")
          provinceName: $(".address-content[data-level=1] li.active").text()
          city: $(".address-content[data-level=2] li.active").data("value")
          cityName: $(".address-content[data-level=2] li.active").text()
          region: $(".address-content[data-level=3] li.active").data("value")
          regionName: $(".address-content[data-level=3] li.active").text()
          street: $(".address-content[data-level=4] li.active").data("value")
          streetName: $(".address-content[data-level=4] li.active").text()
        }
        $(".address-text").text((_.map $(".address-content"), (i) -> $("li.active", i).text()).join(" ")).data(addrData)
        $(".address-text").trigger('ZCYEvent.addressChange')
        return
      $(".address-tab li[data-level=3]").show()
      _.filter data, (i, index) ->
        if (!defaultValue and index is 0) or (defaultValue and defaultValue is i.id)
          $(".address-tab li[data-level=3] a").text(i.name)
      thatTab.html(addressItemTemplate({data, defaultValue}))
      if !thatTab.find("li.active").length
        thatTab.find("li:first").addClass("active")
      $(".address-tab li[data-level=3] a").text(thatTab.find("li.active").text())
      if @levels is 3
        $(".address-text").text((_.map $(".address-content"), (i) -> $("li.active", i).text()).join(" "))
        @callback?()
      else
        @streetChange({})

  ###
    街道切换
  ###
  streetChange: (evt)=>
    element = $(evt.currentTarget)
    selectedId = element.data("selected") || ""
    regionId = $(".address-content[data-level=3] li.active").data("value")
    if !regionId || selectedId.toString() is regionId.toString()
      return
    defaultValue = $(".address-tab li[data-level=4]").data("default")
    if defaultValue
      element.data("default", "")
    element.data("selected", regionId)
    thatTab = $(".address-content[data-level=4]")
    $.get "/api/address/#{regionId}/children", (data)=>
      _.filter data, (i, index) ->
        if (!defaultValue and index is 0) or (defaultValue and defaultValue is i.id)
          $(".address-tab li[data-level=4] a").text(i.name)
      thatTab.html(addressItemTemplate({data, defaultValue}))
      if !thatTab.find("li.active").length
        thatTab.find("li:first").addClass("active")
      $(".address-tab li[data-level=4] a").text(thatTab.find("li.active").text())
      if @levels is 4
        $(".address-text").text((_.map $(".address-content"), (i) -> $("li.active", i).text()).join(" "))
        @callback?()

module.exports = Address
