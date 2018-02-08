let Query = require('common/query/extend');
let Pagination = require('pokeball/components/pagination');
let PaginationTmpl = Handlebars.templates['common/ajax-template-search/templates/pagination'];

class AjaxTemplateSearch {
  constructor(_config) {
    if (!_config.ajaxUrl) {
      throw new Error('AjaxTemplateSearch组件的ajaxUrl为必填' + JSON.stringify(_config));
    }
    if (!_config.template) {
      throw new Error('AjaxTemplateSearch组件的template为必填，为Handlebars.templates的function');
    }

    let _default = {
      template: null, // 模板，为Handlebars.templates的function
      ajaxUrl: '', // ajax请求地址
      extends: null,
      paginationSelector: '', // 分页组件的位置
      root: '', // 组件的根
      appendElem: '.ajax-template', // 结果append位置
      searchElem: '', // 搜索组件的选择器
      searchBtn: '#searchBtn', // 搜索按钮的选择器
      clearBtn: '#resetBtn', // 清空按钮的选择器
      searchResetParams: [], // 搜索时重置的参数
      resetParams: [], //重置时的参数
      callback: null
    };

    this.query = new Query();
    this.query.set('pageSize', 10);
    this.config = $.extend(_default, _config);

    this.bindEvent();

    /* 如果有扩展，填入query */
    if (this.config.extends) {
      $.each(this.config.extends, (key, value) => {
        this.query.set(key, value);
      });
    }
    this._search();
  }

  initTmpl(data, pageNo) {
    let vm = this;
    let initFlag = false;
    $(this.config.paginationSelector).html(PaginationTmpl(data || {}));
    let $itemsPerPageSelector = $(vm.config.root + ' #items-per-page-selector');
    /*为了修改切换分页数量*/
    $itemsPerPageSelector.val(vm.query.get("pageSize"))

    let pagination = new Pagination(vm.config.root + ' .pagination');
    pagination.total($(vm.config.root + ' #pagination-total').data('total'));

    function callback(currentPage) {
      let current = parseInt(currentPage) + 1;
      vm.query.set('pageNo', current);
      vm._search(current);
    }

    function showPagination() {
      let pageSize = $itemsPerPageSelector.val();
      vm.query.set('pageSize', pageSize || 10);
      let currentPage = (pageNo && (pageNo - 1)) || 0;
      pagination.show(pageSize || 10, {
        current_page: (pageNo - 1) || 0,
        callback: callback
      });
      initFlag && callback(currentPage);
    }

    showPagination();
    initFlag = true;
    $('.items-per-page-selector').off('change').on('change', function() {
      pageNo = 0
      showPagination()
    });
  }

  bindEvent() {
    let vm = this;
    $(vm.config.searchBtn).unbind('click').bind('click', function() {
      if (vm.config.searchElem) {
        let $elems = $(vm.config.root).find('input' + vm.config.searchElem + '[name],select' + vm.config.searchElem + '[name],textarea' + vm.config.searchElem + '[name]');

        $elems.each(function() {
          let key = $(this).attr('name');
          let value = $(this).val();

          var elementType = $(this).attr('type');
          if (elementType === 'checkbox') {
            value = $(this).prop('checked');
          }

          if (typeof value === 'undefined' || value === null || value === '') {
            vm.query.remove(key);
          } else {
            vm.query.set(key, value);
          }
          for (let i = 0; i < vm.config.searchResetParams.length; i++) {
            vm.query.remove(vm.config.searchResetParams[i]);
          }
        });
      }

      vm._search();
    });

    $(vm.config.clearBtn).unbind('click').bind('click', function() {
      for (let i = 0; i < vm.config.resetParams.length; i++) {
        vm.query.remove(vm.config.resetParams[i]);
        $(vm.config.root).find("input[name='" + vm.config.resetParams[i] + "']").val("");
        $(vm.config.root).find("select[name='" + vm.config.resetParams[i] + "']").val('').trigger('change');
      }
      /* 如果有扩展，填入query */
      if (vm.config.extends) {
        $.each(vm.config.extends, (key, value) => {
          vm.query.set(key, value);
        });
      }
      vm._search();
    });
  }

  _search(pageNo) {
    let vm = this;
    $.ajax({
      type: 'GET',
      url: vm.config.ajaxUrl + vm.query.toString(),
      contentType: 'application/json',
      async: false,
      success: function(data) {
        /* 将新数据添加到template中，修改分页显示 */
        $(vm.config.root + ' ' + vm.config.appendElem).html(vm.config.template(data));
        vm.initTmpl(data, pageNo);
        vm.config.callback && vm.config.callback(data);
        $('select:not(.noselectric)').selectric();
      }
    });
  }
}

module.exports = AjaxTemplateSearch;