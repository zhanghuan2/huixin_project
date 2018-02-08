var UrlHelper = require("common/url_helper/extend");
var FilterTab = require("common/filter_tab/extend");
var Modal = require("pokeball/components/modal");
var Checker = require("common/formchecker/extend");
var BasicInfoTemplate = Handlebars.templates["common/user-center/templates/basicInfo"];
var BasicInfoDetailTemplate = Handlebars.templates["common/user-center/templates/basicInfoDetail"];
var ChangePwdTemplate = Handlebars.templates["common/user-center/templates/changePwd"];
var ChangeMobileTemplate = Handlebars.templates["common/user-center/templates/changeMobile"];
var ChangeEmailTemplate = Handlebars.templates["common/user-center/templates/changeEmail"];
var VerifyCodePopTemplate = Handlebars.templates["common/user-center/templates/verifyCodePop"];
var isCoolDown = false;
var modalObj;
//密码正则表达式(字母加数字组合)
var reg=/^[A-Za-z0-9]+$/;
//再次获取验证码时间间隔
var seconds = 60;
class UserCenter {
  constructor() {
    //new FilterTab(".tab");
    var here = this;
    //default tab, init basic information and bind its events
    here.initBasicInfo(here);

    //set activeTab
    var activeTab = "basicInfo";
    $("#basicInfo").addClass("active");
    //bind tab click events
    $("#basicInfo").bind("click", function () {
      if (activeTab != "basicInfo") {
        $("#" + activeTab).removeClass("active");
        $("#basicInfo").addClass("active");
        activeTab = "basicInfo";
      }
      here.initBasicInfo(here);
    });
    $("#changePwd").bind("click", function () {
      if (activeTab != "changePwd") {
        $(".mainTable").html(ChangePwdTemplate());
        $("#" + activeTab).removeClass("active");
        $("#changePwd").addClass("active");
        activeTab = "changePwd";
        here.bindChangePwdEvents();
      }
    });
    $("#changeMobile").bind("click", function () {
      if (activeTab != "changeMobile") {
        $.ajax({
          type: "GET",
          contentType: "application/json",
          url: "/api/user/detail",
          success: function(data){
            $(".mainTable").html(ChangeMobileTemplate(data));
            $("#" + activeTab).removeClass("active");
            $("#changeMobile").addClass("active");
            activeTab = "changeMobile";
            here.bindChangeMobileEvents();
          }
        });
      }
    });
    $("#changeEmail").bind("click", function () {
      if (activeTab != "changeEmail") {
        $.ajax({
          type: "GET",
          contentType: "application/json",
          url: "/api/user/detail",
          success: function(data){
            $(".mainTable").html(ChangeEmailTemplate(data));
            $("#" + activeTab).removeClass("active");
            $("#changeEmail").addClass("active");
            activeTab = "changeEmail";
            here.bindChangeEmailEvents();
          }
        });
      }
    });
  }

  //init basic information (edit mode)
  initBasicInfo(here) {
    $.ajax({
      type: "GET",
      contentType: "application/json",
      url: "/api/user/detail",
      success: function (data) {
        var category = $("#category").val();
        $(".mainTable").html(BasicInfoTemplate($.extend(data,{"category": category})));
        here.bindBasicInfoEvents(here);
      }
    });
  }
  //init basic information (detail mode)
  initBasicInfoDetail(here){
    $.ajax({
      type: "GET",
      contentType: "application/json",
      url: "/api/user/detail",
      success: function (data) {
        var category = $("#category").val();
        $(".mainTable").html(BasicInfoDetailTemplate($.extend(data,{"category": category})));
        here.bindBasicInfoDetailEvents(here);
      }
    });
  }

  //bind events for basic information (edit mode)
  bindBasicInfoEvents(here) {
    $("#idType").selectric();
    Checker.formChecker({
      container: ".panel",
      precheck: true,
      ctrlTarget: "#basicInfoSaveBtn"
    });
    //basic info save event
    $("#basicInfoSaveBtn").bind("click", function () {
      var updateUserInfo = {
        name: $("#name").val(),
        mobile: $("#mobile").val(),
        email: $("#email").val(),
        gender: $("input[name='gender']:checked").val(),
        idType: $("#idType").val(),
        idNo: $("#idNo").val(),
        address: $("#address").val(),
        faxNo: $("#faxNo").val(),
        phone: $("#phone").val()
      };
      $.ajax({
        type: "POST",
        url: "/api/user/profile/update",
        contentType: "application/json",
        data: JSON.stringify(updateUserInfo),
        success: function () {
          new Modal({
            icon: "success",
            title: "操作成功",
            content: "用户信息更新成功"
          }).show(function () {
                $.ajax({
                  type: "GET",
                  contentType: "application/json",
                  url: "/api/user/detail",
                  success: function (data) {
                    var category = $("#category").val();
                    var basicInfoDetailHtml = BasicInfoDetailTemplate($.extend(data,{"category": category}));
                    $(".mainTable").html(basicInfoDetailHtml);
                    here.bindBasicInfoDetailEvents(here);
                  }
                });
              });
        }
      });
    });
    //cancel button
    $("#basicInfoCancel").bind("click", function(){
      new Modal({
        icon: "info",
        title: "取消后，已经填写的数据将无法恢复，是否继续？",
        content: "如果您无法确定，请点击取消",
        isConfirm: true
      }).show(function () {
            here.initBasicInfoDetail(here);
          });
    });
    //verify mobile
    here.bindVerifyMobileEvent();
    //verify email
    here.bindVerifyEmailEvent();
    //config account
    $("#accountConfig").bind("click", function () {
      var oldAccount = $("#accountSpan").text();
      if(oldAccount == "-"){
        oldAccount = "";
      }
      $(this).replaceWith("<button class='btn btn-primary' id='accountSaveBtn'>保存</button>");
      $("#accountDiv").html("<input type='text' class='input-account' id='newAccount' placeholder='请输入' value=" + oldAccount + ">");
      $("#accountSaveBtn").bind("click", function () {
        var newAccount = $("#newAccount").val().trim();
        var mobilePattern = /^(13|14|15|17|18)\d{9}$/;
        var pattern = /^[a-zA-Z0-9_]{4,20}$/;
        if (newAccount == "") {
          new Modal({
            icon: "error",
            title: "帐号不能为空"
          }).show(function(){
                $("#newAccount").focus();
              }
          );
        } else if(mobilePattern.test(newAccount)){
            new Modal({
              icon: "error",
              title: "帐号格式不能为手机号"
            }).show(function(){
                $("#newAccount").focus();
              });
        }else {
          if(pattern.test(newAccount)){
            modalObj = new Modal({
            icon: "info",
            title: "请确认帐号",
            content: "帐号名称为" + newAccount + "，请核对",
            isConfirm: true
          });
          modalObj.show(function () {
            $.ajax({
              type: "POST",
              url: "/api/user/changeAccount",
              contentType: "application/json",
              data: JSON.stringify({account: newAccount}),
              success: function () {
                modalObj.close();
                new Modal({
                  icon: "success",
                  title: "配置成功",
                  content: "帐号名称已经配置为" + newAccount
                }).show(function(){
                      window.location.reload();
                    });
              }
            });
          });
        }else{
          new Modal({
            icon: "error",
            title: "帐号长度必须为4-20位，只能为数字、字母、_组成"
          }).show(function(){
            $("#newAccount").focus();
          });
        }
        }
      });
    });

  }
  //bind events for basic information (detail mode)
  bindBasicInfoDetailEvents(here){
    //edit button
    $("#basicInfoEditBtn").bind("click", function(){
      $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/api/user/detail",
        success: function (data) {
          var category = $("#category").val();    
          $(".mainTable").html(BasicInfoTemplate($.extend(data,{"category": category})));
          here.bindBasicInfoEvents(here);
        }
      });
    });
    //verify mobile
    here.bindVerifyMobileEvent();
    //verify email
    here.bindVerifyEmailEvent();

    //config account
    $("#accountConfig").bind("click", function () {
      var oldAccount = $("#accountSpan").text();
      if(oldAccount == "-"){
        oldAccount = "";
      }
      $(this).replaceWith("<button class='btn btn-primary' id='accountSaveBtn'>保存</button>");
      $("#accountDiv").html("<input type='text' class='input-account' id='newAccount' placeholder='请输入' value=" + oldAccount + ">");
      $("#accountSaveBtn").bind("click", function () {
        var newAccount = $("#newAccount").val();
        if (newAccount == "") {
          new Modal({
            icon: "error",
            title: "帐号不能为空"
          }).show(function(){
              $("#newAccount").focus();
            }
          );
        } else {
          modalObj = new Modal({
            icon: "info",
            title: "请确认帐号",
            content: "帐号名称为" + newAccount + "，请核对",
            isConfirm: true
          });
          modalObj.show(function () {
            $.ajax({
              type: "POST",
              url: "/api/user/changeAccount",
              contentType: "application/json",
              data: JSON.stringify({account: newAccount}),
              success: function () {
                modalObj.close();
                new Modal({
                  icon: "success",
                  title: "配置成功",
                  content: "帐号名称已经配置为" + newAccount
                }).show(function(){
                  window.location.reload();
                });
              }
            });
          });
        }
      });
    });
  }
  bindChangePwdEvents(){
    Checker.formChecker({
      container: ".changePwdDiv",
      ctrlTarget: "#pwdModifyConfirm"
    });

    $("#pwdModifyConfirm").bind("click", function(){
      var oldPwd = $("#oldPwd").val();
      var newPwd = $("#newPwd").val();
      var newPwdAgain = $("#newPwdAgain").val();
      $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({oldPassword: oldPwd, newPassword: newPwd}),
        url: "/api/user/changePassword",
        success: function(){
          new Modal({
            icon: "success",
            title: "操作成功",
            content: "密码修改成功"
          }).show(function(){
                window.location.reload();
              });
        }
      });
    });
  }
  bindChangeMobileEvents(){
    Checker.formChecker({
      container: ".changeMobileDiv",
      ctrlTarget: "#mobileModifyConfirm"
    });
    //获取验证码
    $("#getVerifyCodeBtn-change").bind("click", function(){
      var mobile = $("#newMobile").val();
      var regMobile = /^(13|14|15|17|18)\d{9}$/i;
      if(regMobile.test(mobile)){
        $.ajax({
          type: "get",
          url: "/api/user/sms?mobile=" + mobile,
          success: function () {
            $("#getVerifyCodeBtn-change").attr("disabled", true);

            $("#getVerifyCodeBtn-change").text(seconds + "秒后重新获取");
            get_code_time("#getVerifyCodeBtn-change", seconds);
          }
        });
      }else{
        new Modal({
          icon: "error",
          title: "手机号格式不正确",
          content: "手机号码格式为11位数字"
        }).show(function(){
              $("#newMobile").focus();
            });
      }

    });
    //提交修改
    $("#mobileModifyConfirm").bind("click", function(){
      var newMobile = $("#newMobile").val();
      var data = {
        oldMobile: $("#oldMobile").val(),
        newMobile: newMobile,
        captcha: $("#verifyCode").val()
      }
      $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        url: "/api/user/changeMobile",
        success: function(){
          new Modal({
            icon: "success",
            title: "手机号修改成功",
            content: "手机号成功修改为" + newMobile
          }).show(function(){
            window.location.reload();
          });
        }
      });
    });
    function get_code_time(id, time) {
      var int = setInterval(function () {
        if (time <= 0) {
          clearInterval(int);
          isCoolDown = false;
          $(id).removeAttr("disabled");//移除获取验证码按钮的disabled属性
          $(id).text("获取验证码");
        } else {
          isCoolDown = true;
          time--;
          $(id).attr("disabled", true);
          $(id).text(time + "秒后重新获取");//设置获取验证码按钮为不可触发
        }
      }, 1000);
    }
  }
  bindChangeEmailEvents(){
    Checker.formChecker({
      container: ".changeEmailDiv",
      ctrlTarget: "#emailModifyConfirm"
    });
    $("#emailModifyConfirm").bind("click", function(){
      var oldEmail = $("#oldEmail").text();
      var newEmail = $("#newEmail").val();
      var data = {
        oldEmail: oldEmail,
        newEmail: newEmail
      }
      $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        url: "/api/user/changeEmail",
        success: function(){
          new Modal({
            icon: "success",
            title: "邮箱修改成功",
            content: "邮箱已成功修改为" + newEmail
          }).show(function(){
                window.location.reload();
              });
        }
      });
    });
  }
  bindVerifyMobileEvent(){
    $("#verifyMobileBtn").bind("click", function () {
      var mobileElement = $("#mobile");
      var mobile = mobileElement.text().trim() == ""? mobileElement.val(): mobileElement.text().trim();
      if (mobile != "") {
        var html = VerifyCodePopTemplate({'mobile': mobile, 'isCoolDown': isCoolDown});
        modalObj = new Modal(html);
        modalObj.show();
        //验证码输入框 绑定事件
        $("#verifyCode").bind("input propertychange", function () {
          if ($("#verifyCode").val() != "") {
            $("#verifyCodeSubmitBtn").attr("disabled", false);
          } else {
            $("#verifyCodeSubmitBtn").attr("disabled", true);
          }
        });
        //获取验证码按钮 绑定事件
        $("#getVerifyCodeBtn").bind("click", function () {
          $.ajax({
            type: "get",
            url: "/api/user/sms?mobile=" + mobile,
            success: function () {
              $("#getVerifyCodeBtn").attr("disabled", true).text(seconds + "秒可再获取");
              get_code_time("#getVerifyCodeBtn", seconds);
            }
          });
        });
        //确定按钮 绑定事件
        $("#verifyCodeSubmitBtn").bind("click", function () {
          var verifyCode = $("#verifyCode").val();
          $.ajax({
            type: "GET",
            url: "/api/user/verifyMobile?mobile=" + mobile + "&captcha=" + verifyCode,
            success: function () {
              modalObj.close();
              new Modal({
                icon: "success",
                title: "验证成功",
                content: "手机号为" + mobile
              }).show(function () {
                    $("#verifyMobileBtn").replaceWith("<span class='status-able'>已验证</span>");
                  });
            }
          });
        });
      }
    });
    function get_code_time(id, time) {
      var int = setInterval(function () {
        if (time <= 0) {
          clearInterval(int);
          isCoolDown = false;
          $(id).removeAttr("disabled");//移除获取验证码按钮的disabled属性
          $(id).text("获取验证码");
        } else {
          isCoolDown = true;
          time--;
          $(id).attr("disabled", true);
          $(id).text(time + "秒后重新获取");//设置获取验证码按钮为不可触发
        }
      }, 1000);
    }
  }
  bindVerifyEmailEvent(){
    $("#verifyEmailBtn").bind("click", function () {
      var emailElement = $("#email");
      var email = emailElement.text().trim() == ""? emailElement.val(): emailElement.text().trim();
      if (email != "") {
        $.ajax({
          type: "GET",
          url: "/api/user/emailActive?email=" + email,
          success: function () {
            new Modal({
              icon: "success",
              title: "信息提交成功",
              content: "已发送验证邮件到您邮箱中，请进入到邮箱中验证"
            }).show(function () {
                  $("#verifyEmailBtn").parent().html("<span class='status-pending'>邮件已发送，等待验证</span>")
                });
          }
        });
      }
    });
  }
}
module.exports = UserCenter;
