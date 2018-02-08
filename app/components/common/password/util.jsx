
var Util = {
  getUrlParam:function(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
      var r = window.location.search.substr(1).match(reg);  //匹配目标参数
      if (r != null) return unescape(r[2]); return null; //返回参数值
  },
  initProcessBar :function(vm,status) {
    var stepNum = vm.Wizzard.indexOf(status);
    var tmp = [0, 1, 1.5, 2, 2, 2, 2.5, 3, 3.5, 4, 5, 6];
    var $steps = $('.zcy-progress .progress-step');
    var $bars = $('.zcy-progress .progress-bar');
    for(var i = 0; i <= Math.ceil(tmp[stepNum])-1; i++) {
      $($steps[i]).html("").addClass('finished');
      $($steps[i]).html("").removeClass('active');
      if($bars[i]) {
        $($bars[i]).addClass('finished');
      }
    }
    var $stepInfos = $('.zcy-progress .progress-step-info');
    if((tmp[stepNum]+'').indexOf('\.') === -1) {
      $($steps[tmp[stepNum]]).addClass('active');
      $($stepInfos[tmp[stepNum]]).addClass('active');
    }
  },
  checkPassword:function(){
    $('#password').on('input propertychange', function () {
      var pwd = $(this).val();
      var minLen = 6;

      if(pwd.match(/[\d]/) && pwd.match(/[A-Za-z]/) && pwd.match(/[^\da-zA-Z]/) && (pwd.length>=minLen)){
        $('span[name=weak]').addClass('badge-weak');
        $('span[name=normal]').addClass('badge-normal');
        $('span[name=strong]').addClass('badge-strong');
      }
      else if (pwd.match(/[\d]/) && pwd.match(/[A-Za-z]/) && (pwd.length>=minLen)){
        $('span[name=weak]').addClass('badge-weak');
        $('span[name=normal]').addClass('badge-normal');
        $('span[name=strong]').removeClass('badge-strong');
      }
      else if ((pwd.match(/[\d]/) || pwd.match(/[A-Za-z]/)) && (pwd.length>=minLen)){
        $('span[name=weak]').addClass('badge-weak');
        $('span[name=normal]').removeClass('badge-normal');
        $('span[name=strong]').removeClass('badge-strong');
      }
      else{
        $('span[name=weak]').removeClass('badge-weak');
        $('span[name=normal]').removeClass('badge-normal');
        $('span[name=strong]').removeClass('badge-strong');
      }
    });
  }
};

module.exports = Util;
