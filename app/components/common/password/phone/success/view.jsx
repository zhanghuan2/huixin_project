var checker = require("common/formchecker/extend");
var Modal = require("pokeball/components/modal");
var processTemplate = Handlebars.templates["common/password/phone/templates/processbar"];
var Util      = require('common/password/util');

var here;
class phoneFindSuccess{
  constructor(){

    here = this;
    here.Wizzard = ["fill-info", "success"];

    var html = processTemplate({
      "fill-info": "active",
      "success": "active"
    });
    var bar = document.getElementById("forgetPasswordProcessBar");
    bar.innerHTML = html;

    Util.initProcessBar(here,"success");

    $('#commit').bind('click', function () {
      window.location.href = "/login";
    });
  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = phoneFindSuccess;
