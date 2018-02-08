var checker = require("common/formchecker/extend");
var Modal = require("pokeball/components/modal");
var processTemplate = Handlebars.templates["common/password/mail/templates/processbar"];
var Util      = require('common/password/util');

var here;
class mailSetNewPassword{
  constructor(){

    here = this;
    here.Wizzard = ["fill-info","set-new", "success"];

    var html = processTemplate({
      "fill-info": "active",
      "set-new": "active",
      "success": ""
    });

    var bar = document.getElementById("forgetPasswordProcessBar");
    bar.innerHTML = html;

    Util.initProcessBar(here,"set-new");

    checker.formChecker({container: '.panel', ctrlTarget: '#commit'});
    /* 注册按钮 */
    $('#commit').on('click', function () {
      $('#commit').attr('disabled', true);
      setTimeout(function(){$('#commit').attr('disabled', false);}, 1000);
      var Obj = {
        "password": $('#password').val(),
        "key":Util.getUrlParam("key")
      };
      $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/api/user/forgotPasswordByEmail",
        data: JSON.stringify(Obj),
        success : function () {
            window.location.href = "/password-find/mail/success";
        }
      });
    });

    Util.checkPassword();
  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = mailSetNewPassword;
