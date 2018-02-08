
/** *
  * 筛选使用的Tab
  * @author sx-wangx@dtdream.com
  */

var UrlHelper = require("common/url_helper/extend");
var LocalStorage = require("common/local_storage/extend");

class FilterTab {
  constructor(selector, map, paramsToKeep) {
    var vm = this;
    this.name   = $(selector).attr('name');
    this.helper = new UrlHelper(null);
    this.path   = window.location.pathname.replace(/^\//g, '').replace(/\/$/g, '');
    // binding
    $(selector+' li').bind('click', function(event) {
      var name = $(this).attr('name')?$(this).attr('name'):vm.name;
      var v = $(this).attr('value');
      var paramsToGo = {};
      if(v && v !== "") {
        if(typeof map === 'object') {
          if(typeof map[v] !== 'undefined') {
            paramsToGo[name] = map[v];
          } else {
            paramsToGo[name] = v;
          }
        } else {
          paramsToGo[name] = v;
        }
      }

      if(vm.name && typeof v != 'undefined') {
        vm.saveState();
        var filterCache = LocalStorage.get('filterCache');
        if(filterCache) {
          var oldParams = filterCache[vm.path+':'+v];
          if(oldParams) {
            $.extend(paramsToGo, oldParams);
          }
        }
        if(paramsToKeep) {
          for (var i = 0; i < paramsToKeep.length; i++) {
            var keepName = paramsToKeep[i];
            var keepValue = $.query.get(keepName);
            if(keepValue != '') {
              paramsToGo[keepName] = keepValue;
            }
          }
        }
        vm.helper.go(paramsToGo, true, v);
      }
    })
    // init
    var tab = window.location.hash?window.location.hash.substring(1):undefined;
    if(tab) {
      this.state = tab;
      $(selector+' li[value="'+tab+'"]').addClass('active');
      $('[for="'+this.name+'"]').hide();
    } else {
      this.state = $($(selector+' li')[0]).addClass('active').attr('value');
    }
  }
  saveState() {
    var paramsToSave = {};
    $.extend(paramsToSave, this.helper.params);

    var toSave = {};
    toSave[this.path+':'+this.state] = paramsToSave;

    var filterCache = LocalStorage.get('filterCache');
    if(!filterCache) {
      filterCache = toSave;
    } else {
      $.extend(filterCache, toSave);
    }
    LocalStorage.set('filterCache', filterCache);
  }
}

module.exports = FilterTab;