var checker = require("common/formchecker/extend");
var Modal = require("pokeball/components/modal");
var processTemplate = Handlebars.templates["common/password/mail/templates/processbar"];
var Util      = require('common/password/util');

var here;
class mailFindSuccess{
  constructor(){

    here = this;
    here.Wizzard = ["fill-info", "set-new", "success"];

    var html = processTemplate({
      "fill-info": "active",
      "set-new": "active",
      "success": "active"
    });
    var bar = document.getElementById("forgetPasswordProcessBar");
    bar.innerHTML = html;

    Util.initProcessBar(here,"success");

    /*密码找回成功，返回登录界面*/
    $('#commit').bind('click', function () {
      window.location.href = "/login";
    });
  }
  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = mailFindSuccess;
