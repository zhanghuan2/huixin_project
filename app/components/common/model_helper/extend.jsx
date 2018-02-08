module.exports = {
  fromForm: function(config) {
    var _config = {
      container: undefined, // 在指定容器中寻找表单元素
      skipEmptyVal: false      // 是否跳过值为空的表单元素
    }
    $.extend(_config, config);

    var $targets = $('input, select, textarea');
    if(_config.container) {
      $targets = $(_config.container).find('input, select, textarea');
    }

    var result = {};
    $targets.each(function() {
      var k = $(this).attr('name');
      var v = $(this).val();
      var type = $(this).attr('type');
      if(typeof k === 'undefined') return;
      if(_config.skipEmptyVal && v === '') return;
      if(type === 'radio') {
        if($(this).is(':checked')) {
          result[k] = v;
        }
      } else if(type === 'checkbox') {
        if($(this).is(':checked')) {
          if(typeof result[k] === 'list') {
            result[k].push(v);
          } else {
            result[k] = [v];
          }
        }
      } else {
        result[k] = v;
      }
    });
    return result;
  },
  applyForm: function(context, config) {
    var _config = {
      container: undefined // 在指定容器中寻找表单元素
    }
    $.extend(_config, config);

    for(var k in context) {
      var $target = $('[name="'+k+'"]');
      if(_config.container) {
        $target = $(_config.container).find('[name="'+k+'"]');
      }
      $target.val(context[k]);
    }
  },
  fromModel: function(context,config) {
    // 构建前端渲染数据传数据时 字段： 区号 电话 分机 完整的号码 可以带上
    var _config = {
      container: undefined,      // 在指定容器中寻找model
      includeHtmlTag: false      // 是否包含HTML标记
    }
    $.extend(_config, config);

    var $targets = $('[data-model]');
    if(_config.container) {
      $targets = $(_config.container).find('[data-model]');
    }

    var result = {};
    if(context!=null && typeof context !='undefined'){
      result=context;
    }
    $targets.each(function() {
      var k = $(this).data('model');
      var v = $(this).text().trim();
      if(_config.includeHtmlTag) {
        v = $(this).html().trim();
      }
      if(typeof k === 'undefined') return;
      result[k] = v;
    });

    var $idTarget = $('[data-id]');
    if(_config.container) {
      if(typeof $(_config.container).attr('data-id') !== 'undefined') {
        result.id = $(_config.container).data('id');
      } else {
        $idTarget = $(_config.container).find('[data-id]');
        if($idTarget.length > 0) {
          result.id = $($idTarget[0]).data('id');
        }
      }
    }
    return result;
  },
  applyModel: function(context,config) {
    var _config = {
      container: undefined,    // 在指定容器中寻找model
      useHtml: false           // 进行html编码转义
    }
    $.extend(_config, config);

    for(var k in context) {
      var $target = $('[data-model="'+k+'"]');
      if(_config.container) {
        $target = $(_config.container).find('[data-model="'+k+'"]');
      }
      if(_config.useHtml) {
        $target.html(context[k]);
      } else {
        $target.text(context[k]);
      }
    }
  }
};