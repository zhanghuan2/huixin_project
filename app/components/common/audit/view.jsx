const Service = require('common/audit/service')

export default class ZcyAudit {
  constructor () {
    this.stepParams = {}
    this.nextStep = {}
    this.prevStep = {}
    this.beforeRender()
    this.bindEvent()
  }

  beforeRender () {
    this.initStepUrl()
    this.renderOpinions()

    // 有下一步环节
    if ($('#next-org').size()) {
      this.renderNextOrg()
    }

    if ($('.zcy-audit-attachment').size()) {
      $('.zcy-audit-attachment').uploadFile()
    }
  }

  renderOpinions () {
    let $zcyOpinion = $('#zcy-opinion')
    let queryUrl = $zcyOpinion.data('queryUrl')
    // 初始化审核意见
    Service.queryOpinions(queryUrl)
    .then((opinions) => {
      return opinions && $.map(opinions, (opinion) => {
        return `<option value="${opinion}">${opinion}</option>`
      })
    }).then((options) => {
      if (!options || !options.length) {
        return
      }
      $zcyOpinion.html(options)
      this.reRenderOpinions()
    })
  }

  getStepData (isPass = true, params) {
    if (isPass && this.nextStep.data) {
      return $.Deferred().resolve(this.nextStep.data)
    }
    if (!isPass && this.prevStep.data) {
      return $.Deferred().resolve(this.prevStep.data)
    }

    params = $.extend(params || this.stepParams, {isPass})
    let url = isPass ? this.nextStep.url : this.prevStep.url
    return Service.queryNextStep(url, params)
      .then((data) => {
        if (!data.success || !data.result) {
          return []
        }
        // cache之前访问的数据，避免多次请求
        if (isPass) {
          this.nextStep.data = data.result
          return this.nextStep.data
        }
        this.prevStep.data = data.result
        return this.prevStep.data
      })
  }

  initStepUrl () {
    let $nextOrg = $('#next-org')
    let orgQueryUrl = $nextOrg.data('queryUrl')
    if (!orgQueryUrl) {
      throw new Error('请填写zcy-audit 的下一步审核人的查询接口')
    }
    let nextOrgUrls = orgQueryUrl.split(',')
    if (nextOrgUrls.length > 1) {
      this.prevStep.url = nextOrgUrls[1]
      this.nextStep.url = nextOrgUrls[0]
    } else {
      this.prevStep.url = nextOrgUrls[0]
      this.nextStep.url = nextOrgUrls[0]
    }

    let queryParams = $nextOrg.data('queryParams')
    if (queryParams) {
      let params = queryParams.split(',')
      $.each(params, (index, param) => {
        this.stepParams[param] = $.query.get(param)
      })
    }
  }

  renderNextOrg (isPass) {
    let $nextOrg = $('#next-org');

    this.getStepData(isPass).then((orgs) => {
      this.org = orgs;
      if (orgs.length >0) {
        this.renderNextUser(orgs[0].userDtos,orgs[0].flowSectConfig.flowSect=='end')
      }

      return $.map(orgs, (org,index) => {
        return `<option value="${org.flowSectConfig.status}" index="${index}" >${org.flowSectConfig.sectName}</option>`
      })
    }).then((options) => {
      $nextOrg.html(options).selectric('refresh')
    })
  }

  renderNextUser (users,end) {
    let $nextUser = $('#next-user');
    let options=[];
    if(users&&users.length){
     options = $.map(users, (user) => {
        return `<option value="${user.id}">${user.displayName}</option>`
      })
      $("#auditAlter").hide();
    }else{
      options =`<option value="" end="${end}" class="js-auditEnd">无</option>`;
      if(!end){
          $("#auditAlter").show();
      }
    }
    $nextUser.html(options).selectric('refresh')
  }

  bindEvent () {
    let _this = this
    // 初始化为0
    let $counter = $('.counter')
    $counter.text(0)

    let $zcyOpinion = $('#zcy-opinion')
    let addUrl = $zcyOpinion.data('addUrl')

    $('.zcy-audit .input-radio').on('change', function () {
      let isPass = $(this).val() == 1
      let $nextOrgLabel = $('.next-org-label')
      let nextLabel = $nextOrgLabel.data('nextLabel')
      let prevLabel = $nextOrgLabel.data('prevLabel')
      $nextOrgLabel.text(isPass ? nextLabel : prevLabel || nextLabel)
      _this.renderNextOrg(isPass)
    })

    /**
     * 输入
     */
    $('textarea').on('input', function () {
      let val = $(this).val()
      let length = val.length
      let maxLength = $counter.data('max')

      // 没有值时禁用添加按钮
      if (!length) {
        $('#add-opinion').attr('disabled', true)
      } else {
        $('#add-opinion').attr('disabled', false)
      }

      $counter.text(length)
      if (maxLength <= length) {
        $(this).val(val.substring(0, maxLength))
        $counter.addClass('text-danger')
        $counter.text(maxLength)
      } else {
        $counter.removeClass('text-danger')
      }
    })

    /**
     * 添加意见
     */
    $('#add-opinion').on('click', () => {
      let text = $('textarea[name=remark]').val()
      if (!text) {
        ZCY.Message.warning('请先填写意见！')
        return false
      }
      let maxLength = $counter.data('max') || 500
      if (text.length > maxLength) {
        ZCY.Message.warning(`意见最多为${maxLength}个字`)
        return false
      }

      Service.addOpinion(addUrl, text)
      .then((id) => {
        ZCY.Message.success('新增意见成功！')
        $zcyOpinion.append(`<option value="${id}">${text}`)
        this.reRenderOpinions()
      })
    })
    $("#next-org").on('change',function () {
        let index = $(this).find(":selected").attr("index");
        _this.renderNextUser(_this.org[index].userDtos,_this.org[index].flowSectConfig.flowSect=="end");
    });
  }

  reRenderOpinions () {
    let $zcyOpinion = $('#zcy-opinion')
    if ($zcyOpinion.data('selectric')) {
      $zcyOpinion.selectric('destroy')
    }
    $zcyOpinion.selectric({
      optionsItemBuilder: (item, elem, index) => {
        return item.text
      }
    })
    // 选中意见，自动填入意见输入框
    .off('selectric-change').on('selectric-change', () => {
      let opinion = $zcyOpinion.find('option:selected').text()
      $('textarea').val(opinion)
    })

    let delUrl = $zcyOpinion.data('delUrl')
    /**
     * 删除意见
     */
    // $('.zcy-audit-opinion .del-opinion')
    // .off('click.opinion')
    // .on('click.opinion', function () {
    //   let index = $(this).closest('li').data('index')
    //   let $option = $($zcyOpinion.find('option').get(index))
    //   Service.delOpinion(delUrl, $option.val())
    //   .then(() => {
    //     ZCY.Message.success('删除意见成功！')
    //     $option.remove()
    //     $zcyOpinion.selectric('refresh')
    //   })
    // })
  }

  getData () {
    let formJson = $('.zcy-audit form').serializeObject()
    let attachment = $('.zcy-audit-attachment').data('name')
    if (attachment) {
      formJson[attachment] = $('.zcy-audit-attachment').data('uploadFile').getFiles()
    }
    return formJson
  }
}
