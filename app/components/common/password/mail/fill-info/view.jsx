var checker = require("common/formchecker/extend");
var Modal = require("pokeball/components/modal");
var processTemplate = Handlebars.templates["common/password/mail/templates/processbar"];
var Util      = require('common/password/util');

var here;
class forgetPassword{
  constructor(){

    here = this;
    here.Wizzard = ["fill-info","set-new", "success"];

    var html = processTemplate({
      "fill-info": "active",
      "set-new": "",
      "success": ""
    });

    var bar = document.getElementById("forgetPasswordProcessBar");
    bar.innerHTML = html;

    Util.initProcessBar(here,"active");

    checker.formChecker({container: '.panel', ctrlTarget: '#commit'});
    /* 注册按钮 */
    $('#commit').on('click', function () {
      $('#commit').attr('disabled', true);
      setTimeout(function(){$('#commit').attr('disabled', false);}, 1000);
      var Obj = {
        "email":    $('#email').val(),
      };
      $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/api/user/emailForgotPassword",
        data: Obj,//JSON.stringify(Obj),
        success : function () {
          new Modal({
            "icon": "success",
            "title": "邮件发送成功",
            "content": "邮件发送成功，请从邮件中打开链接继续操作！"
          }).show(function () {
            window.location.href="/login";
          });
        }
      });
    });

  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = forgetPassword;
