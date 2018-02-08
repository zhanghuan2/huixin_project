var ComplexSearch = require("common/complex_search/extend");

class SearchPanel {
  constructor() {
    var _config = $("#search-config").attr("value");
    /* 设置[时间变量]的格式 */
    var timeList = $(".timeStart");
    var param="{";
    for(var i=0; i<timeList.length;i++){
      if (i!==0) {
        param +=",";
      }
      param += "\"" + $(timeList[i]).attr('name') + "\":{\"format\":\"startDate\"}";
    }
    timeList = $(".timeEnd");
    for(var j=0; j<timeList.length;j++){
      param += ",\"" + $(timeList[j]).attr('name') + "\":{\"format\":\"endDate\"}";
    }
    param+="}";
    SearchPanel.config.param = JSON.parse(param);
    var search = new ComplexSearch($.extend(SearchPanel.config, JSON.parse(_config)));

    /* 时间输入框初始化 */
    $('.date-input').datepicker();

    /* 高级设置保存事件 */
    $('#do-set-option').unbind('click').bind('click', function(){
      var checkboxInput = $("#set-option input[type='checkbox']");
      var dataSpan = $(".search-data");
      var checkedNum = 0;
      var html = "";
      for(var i=0;i<checkboxInput.length;i++){
        if ($(checkboxInput[i]).is(':checked') == true) {
          if (checkedNum % 3 == 0) {
            html += "<tr>";
          }
          checkedNum ++;
          html += "<td class=\"search-label\">" + $(dataSpan[i]).attr("data-label") + 
                    "：</td><td>" + $(dataSpan[i]).parent().html() + "</td>";
        }else{
          html += "<td class=\"search-label\"hidden>" + $(dataSpan[i]).attr("data-label") + 
                    "：</td><td hidden>" + $(dataSpan[i]).parent().html() + "</td>";
        }
      }
      $(".search-panel table").html(html);
      if (checkedNum>3) {
        $("[name='sizeLBtnGroup']").show();
        $("[name='sizeSBtnGroup']").hide();
      }else{
        $("[name='sizeLBtnGroup']").hide();
        $("[name='sizeSBtnGroup']").show();
      }
    });
  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}
SearchPanel.config={
  tabElem: ".tab",
  searchElem: ".search",
  searchResetParams: ['pageNo']
};
module.exports = SearchPanel;