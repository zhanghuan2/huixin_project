$.fn.amount = ->
  $(@).each (d, i) ->
    container = $(i)

    $(".count-number", container).on "change", ->
      if container.data("min") or container.data("min") is 0
        min = parseInt container.data("min")
      else
        min = 1
      if container.data("max") or container.data("max") is 0
        max = parseInt container.data("max")
      else
        max = Number.MAX_VALUE
      oldValue = $(@).data("old") || min
      newValue = $(@).val()
      # 新值不是数字 直接设为旧值返回
      if (!_.isNumber(parseInt newValue)) or isNaN(parseInt newValue)
        $(@).val(oldValue)
      # 新值小于1 设为1
      if (newValue < min)
        newValue = min
        $(@).val(newValue)

      if (newValue > max)
        newValue = max
        $(@).val(newValue)
      $(@).data("old", newValue)
      if _.isEqual parseInt(newValue), min
        $(@).prev().addClass("disabled")
      else
        $(@).prev().removeClass("disabled")

    #数量减号动作
    $(".minus", container).on "click", ->
      if container.data("min") or container.data("min") is 0
        min = container.data("min")
      else
        min = 1
      input = $(@).next()
      count = parseInt(input.val())
      if (count > min)
        input.val(count - 1)
        input.trigger("change")
        $(".plus", container).removeClass("disabled")
        if _.isEqual parseInt(input.val()), min
          $(@).addClass("disabled")
      else if count is min
        $(@).addClass('disabled')
      else
        input.val(min)

    #数量加号动作
    $(".plus", container).on "click", ->
      if container.data("max") or container.data("max") is 0
        max = container.data("max")
      else
        max = Number.MAX_VALUE
      input = $(@).prev()
      count = parseInt(input.val())
      if count < max
        input.val(count + 1)
        input.trigger("change")
        $(".minus", container).removeClass("disabled")
        $(@).removeClass("disabled")
        if _.isEqual parseInt(input.val()), max
          $(@).addClass("disabled")
      else if count is max
        $(@).addClass("disabled")
      else
        input.val(max)
