var checker = require("common/formchecker/extend");
var Modal = require("pokeball/components/modal");
var processTemplate = Handlebars.templates["common/password/phone/templates/processbar"];
var Util      = require('common/password/util');

var here;
class forgetPassword{
  constructor(){

    here = this;

    var html = processTemplate({
      "fill-info": "active",
      "success": ""
    });
    var bar = document.getElementById("forgetPasswordProcessBar");
    bar.innerHTML = html;

    checker.formChecker({container: '.panel', ctrlTarget: '#commit'});
    /* 注册按钮 */
    $('#commit').on('click', function () {
      $('#commit').attr('disabled', true);
      setTimeout(function(){$('#commit').attr('disabled', false);}, 1000);
      var Obj = {
        "password": $('#password').val(),
        "mobile": $('#phone').val(),
        "captcha": $('#verification').val(),
      };
      $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/api/user/forgotPasswordByMobile",
        data: JSON.stringify(Obj),
        success : function () {
            window.location.href = "/password-find/phone/success";
        }
      });
    });

    /* 验证码按钮 */
    $('#verification-btn').on('click', function () {
      var Obj = {
        "mobile": $('#phone').val()
      };
      $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/api/user/sms",
        data: Obj,//JSON.stringify(Obj),
        success: function () {
          $('#verification-btn').attr('disabled', 'disabled');
          here.verifyCountdown();
        }
      });
    });

    $('#phone').bind('change',function(){
      var checkerlocal = checker.checker.maps.get("mobile");

      var obj = $('#phone');
      if(checkerlocal.check(checkerlocal, obj) === true){
        $('#verification-btn').removeAttr('disabled');
      }
      else{
        $('#verification-btn').attr("disabled",'disabled');
      }
    });

    Util.checkPassword();
  }

  /* 验证码使能倒计时 */
  verifyCountdown() {
    var delay = 60;
    var Int = setInterval(function () {
      if (delay <= 0) {
        clearInterval(Int);
        $('#verification-btn').attr('disabled', false);
        $('#verification-btn').html('获取验证码');
        return;
      }
      $('#verification-btn').html(delay + '秒后可再获取');
      delay--;
    }, 1000);
  }
}

module.exports = forgetPassword;
