
var LocalStorage = require("common/local_storage/extend");
var needCaptcha = "false";

class ZcyLoginForm {
  constructor() {
    LocalStorage.del("filterCache");
    LocalStorage.del("searchCache");
    if (LocalStorage.get("username") != undefined && LocalStorage.get("username") != "") {
      $("#login-by").val(LocalStorage.get("username"));
      $("#auto-login").prop("checked", "checked");
    }
    
    let $forgetBtn = $('#forget-username');
    let $info = $forgetBtn.siblings('.popover-info').clone(true).show();
    $forgetBtn.mouseenter(function() {
      $forgetBtn.popover({
        placement: 'bottom',
        html: true,
        content: $info
      })
      .popover('show');
    })
    .mouseleave(function(){
        $(this).popover('destroy');
    });
    
    $('#login-now').click(function () {
      if ($('#login-by').val().trim() == "") {
        $('#error-text').parents('.input-row')
          .removeClass('hidden')
          .end()
          .text("请输入帐号/邮箱/手机号");
      } else {
        $.ajax({
          'url': '/api/user/login',
          'data': {
            'loginBy': $('#login-by').val(),
            'password': $('#password').val(),
            'captcha': $('#captcha').val(),
            'target': $.query.get('target')
          },
          'dataType': 'text',
          'type': 'POST',
          'success': function (href) {
            if ($("#auto-login").prop("checked") == true) {
              LocalStorage.set("username", $("#login-by").val());
            } else {
              LocalStorage.del("username");
            }
            window.location.href = href;
          },
          'error': function (response) {
            $('#error-text').parents('.input-row')
              .removeClass('hidden')
              .end()
              .text(response.responseText);
            checkNeedCaptcha();
            if (needCaptcha == "true") {
              $('#img-captcha').attr('src', '/api/user/captcha?rc=' + new Date().getTime());
            }
          }
        });
      }
    });

    function checkNeedCaptcha() {
      $.ajax({
        'url': '/api/user/needCaptcha',
        'dataType': 'text',
        'type': 'GET',
        'success': function (data) {
          needCaptcha = data;
          if (needCaptcha == "true") {
            $('#div-captcha').show();
          }
        }
      });
    }

    checkNeedCaptcha();

    $('#img-captcha').click(function(){
      $('#img-captcha').attr('src', '/api/user/captcha?rc=' + new Date().getTime()) ;
    });

    $('.input').keyup(function(event){
      $('#error-text').closest('.input-row').addClass('hidden');

      let username = $('#login-by').val();
      let emailPattern = new RegExp(/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/);
      let normalPattern = new RegExp(/^[a-zA-Z0-9_]*$/);

      if(13 === event.keyCode && !$('#login-now').prop('disabled')) {
        $('#login-now').trigger('click');
      }
    });
  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = ZcyLoginForm