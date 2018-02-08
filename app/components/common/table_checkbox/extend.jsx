
/** *
  * 表格行选择的checkbox
  * @author sx-wangx@dtdream.com
  */

class TableCheckbox {
  constructor(selector, config) {
    // 读取配置
    var conf = {
      onTotalChange: undefined,
      onLineChange: undefined,
    }
    if(config) {
      $.extend(conf, config);
    }
    this.selector = selector;
    this.config   = conf;
    // 选择器检查
    var $table = $(selector);

    if (0 == $table.length) return $table;
    if($table.length != 1) {
      throw new Error('[TableCheckbox] Only one element can be selected! Please check your selector.')
    }

    // 构造表格
    var totalElement = '<th width="30"><input type="checkbox" name="table-total-check"></th>';
    var lineElement = '<td width="30"><input type="checkbox" name="table-line-check"></td>';
    $table.find('thead tr,tfoot tr').prepend(totalElement);
    $table.find('tbody tr').prepend(lineElement);

    // 添加监听逻辑
    var $total = $(selector+' input[name="table-total-check"]');
    var $line = $(selector+' input[name="table-line-check"]');
    // 先判断是否需要这个batch选项
    $line.each(function(e) {
      if(conf.haveBatch){
        if(!conf.haveBatch($line[e])){
          $($line[e]).parent().find("input").remove();
        }
      }
    });
    $total.bind('click', function(event) {
      if($(this)[0].checked) {
        $total.prop("checked", true);
        $line.prop("checked", true);
        if(conf.onTotalChange) conf.onTotalChange($(selector).find('tbody tr'), true);
      } else {
        $total.prop("checked", false);
        $line.prop("checked", false);
        if(conf.onTotalChange) conf.onTotalChange($(selector).find('tbody tr'), false);
      }
    });
    $line.bind('click', function(event) {
      var result = true;
      $line.each(function(e) { result&=$(this)[0].checked });
      if(conf.onLineChange) conf.onLineChange($(this).parents('tr'), $(this)[0].checked);
      if($total[0].checked != result) {
        $total.prop("checked", result);
        // if(conf.onTotalChange) conf.onTotalChange($(selector).find('tbody tr'), result);
      }
    });
  }

  getCheckedLines() {
    return $(this.selector+' input[name="table-line-check"]:checked').parent().parent();
  }
}

module.exports = TableCheckbox;