
/** *
  * URL解析及参数表单对应
  * @author sx-wangx@dtdream.com
  */

class UrlHelper {
  /** *
    * 构造函数
    *
    * @param selector 可选参数, 执行参数转换的元素选择器
    * 忽略该参数, 默认对所有input和select进行参数转换
    * 为null, 则不对任何元素进行参数转换
    */
  constructor(selector) {
    var origin = window.location.origin;
    // IE8、9不支持location.origin，进行拼接
    if (typeof origin === 'undefined') {
      origin = window.location.protocol + '//' + window.location.host;
    }
    this.queryPath    = origin + window.location.pathname;
    this.params       = {};

    if(window.location.search) {
      window.location.search.substring(1).split('&').map(x => {
        this.params[decodeURI(x.split('=')[0])] = decodeURI(x.split('=')[1])
      });
    }

    // 没有定义selector参数
    if(typeof selector === 'undefined') {
      this.selector = "";
      for(var k in this.params) {
        $('input[name="'+k+'"],select[name="'+k+'"],textarea[name="'+k+'"]').val(this.params[k]);
      }
    }
    // selector参数为null
    else if(selector === null) {
      this.selector = "";
    }
    // selector参数有效
    else {
      this.selector = selector;
      for(var k in this.params) {
        $('input'+this.selector+'[name="'+k+'"],select'+this.selector+'[name="'+k+'"]').val(this.params[k]);
      }
    }
  }

  /** *
    * 进行搜索, 生成搜索的url并访问
    *
    * @param paramsToReset 可选参数, ==true: 清空所有参数, ==[...]: 在执行搜索时需要重置的参数列表. ==null || ==undefined: 覆盖已有参数
    * @_clear 不可见参数, 用于内部调用, 不建议外部使用本参数
    */
  filter(paramsToReset, _clear) {
    var vm = this, $inputs = {}, newParams = {};
    console.log('input'+this.selector+',select'+this.selector+',textarea'+this.selector)
    $('input'+this.selector+',select'+this.selector+',textarea'+this.selector).each(function(index) {
      var pn, pv;
      if(typeof(pn = $(this).attr('name')) != 'undefined') {
        if(_clear) {
          newParams[pn] = '';
        } else {
          if((pv = $(this).val()) != undefined || pv != "") {
            newParams[pn] = pv;
          }
        }
      }
    });
    if(paramsToReset === true) {
      this.params = newParams;
    } else if(typeof paramsToReset === 'undefined' || paramsToReset === null) {
      $.extend(this.params, newParams);
    } else {
      $.extend(this.params, newParams);
      paramsToReset.map((x) => (delete this.params[x]));
    }

    // 生成search参数
    var s = [], pv;
    for(var k in this.params) {
      if((pv=this.params[k])==='' || pv===null || pv===undefined) {
        delete this.params[k];
      }
      else {
        s.push(k+'='+pv);
      }
    }
    var oldSearch = decodeURI(window.location.search);
    var newSearch = decodeURI('?' + s.join('&'));
    var hash = window.location.hash;
    if(s.length>0) {
      window.location.href = this.queryPath + '?' + s.join('&') + (typeof hash != 'undefined'?(hash):'');
    } else {
      window.location.href = this.queryPath + (typeof hash != 'undefined'?(hash):'');
    }
    if(oldSearch == newSearch) {
      setTimeout(function() {
        window.location.reload();
      }, 50);
    }
  }

  /** *
    * 进行清空所有搜索状态
    *
    * @param paramsToReset 可选参数, ==true: 清空所有参数, ==[...]: 在执行搜索时需要重置的参数列表. ==null || ==undefined: 覆盖已有参数
    */
  clear(paramsToReset) {
    this.filter(paramsToReset, true);
  }

  /** *
    * 自定义参数进行访问
    *
    * @param params        必选参数, 自定义参数
    * @param paramsToReset 可选参数, ==true: 清空所有参数, ==[...]: 在执行搜索时需要重置的参数列表. ==null || ==undefined: 覆盖已有参数
    */
  go(params, paramsToReset, hash) {
    var s = [];
    var tmpParams = {};

    if(paramsToReset === true) {
      tmpParams = params;
    } else if(typeof paramsToReset === 'undefined' || paramsToReset === null) {
      $.extend(tmpParams, this.params);
      $.extend(tmpParams, params);
    } else {
      tmpParams = params;
      paramsToReset.map((x) => (delete tmpParams[x]));
    }

    for(var k in tmpParams) {
      s.push(k+'='+tmpParams[k]);
    }

    var oldSearch = decodeURI(window.location.search);
    var newSearch = decodeURI('?' + s.join('&'));
    if(s.length>0) {
      window.location.href = this.queryPath + '?' + s.join('&') + '#' + (typeof hash != 'undefined'?(hash):'');
    } else {
      window.location.href = this.queryPath + '#' + (typeof hash != 'undefined'?(hash):'');
    }
    if(oldSearch == newSearch) {
      setTimeout(function() {
        window.location.reload();
      }, 50);
    }
  }
}

module.exports = UrlHelper;