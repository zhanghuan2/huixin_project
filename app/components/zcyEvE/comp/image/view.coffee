class Image

  constructor: ($) ->
    @target = @$el
    @bindEvent()

  bindEvent: ->
    $(window).on "resize", @resizeWindow

  resizeWindow: =>
    @target.height @target.find("img").innerHeight()

module.exports = Image
