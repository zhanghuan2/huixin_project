Pokeball = require "pokeball"
require "extras/ajax"
require "helpers/numbers"
require "extras/handlebars"
require "extras/input_amount"
require "helpers/profile"
require "extras/auth_load"
require "extras/textarea"
require "extras/uploadFile"
require "extras/timePicker"
require "extras/zcyDistrict"
require "extras/zcyAddress"
require 'plugins/zcy'
module.exports = ->
  window.envLocale = "zh-cn"
  require("helpers/component").initialize()
  # require("pokeball/helpers/component").initialize()
  # new Pokeball.Pagination(".pagination").total($(".pagination").data("total")).show(20)
  $('select:not(.noselectric):visible').selectric()
