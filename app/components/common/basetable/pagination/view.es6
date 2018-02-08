var Pagination = require("pokeball/components/pagination");

class ZcyPagination {
  constructor() {
    var $itemsPerPageSelector = $('#items-per-page-selector');
    $itemsPerPageSelector.val($.query.get('pageSize') || $itemsPerPageSelector.val()).selectric()

    new Pagination(".pagination").total($('#pagination-total').data('total')).show($itemsPerPageSelector.val(), {
      callback: function(curr, pagesize) {
        // window.location.search = $.query.set('pageNo', parseInt(curr) + 1).toString();
        let pageNo = Number($.query.get('pageNo'));
        let searchStr =  window.location.search;
        if(!isNaN(pageNo)){
          searchStr =  searchStr.replace(`&pageNo=${pageNo}`,'')
        }
        window.location.search = `${searchStr}&pageNo=${Number(curr)+1}`;
      }
    });
    $('#items-per-page-selector').on('change', function(event) {
      new Pagination(".pagination").total($('#pagination-total').data('total')).show($itemsPerPageSelector.val(), {
        callback: function(curr, pagesize) {
          //window.location.search = $.query.set('pageNo', parseInt(curr) + 1).toString();
          let pageNo = Number($.query.get('pageNo'));
          let searchStr = window.location.search;
          if(!isNaN(pageNo)){
             searchStr =  searchStr.replace(`&pageNo=${pageNo}`,'')
          }
          window.location.search = `${searchStr}&pageNo=${Number(curr)+1}`;
        }
      });
      let pageSize = Number($.query.get('pageSize'));
      if(pageSize !== Number($itemsPerPageSelector.val())){
        let pageNo = $.query.get('pageNo');
        let searchStr = window.location.search.replace(`&pageNo=${pageNo}`,'');
        if(!isNaN(pageSize)){
          searchStr = searchStr.replace(`&pageSize=${pageSize}`,'');
        }
        window.location.search =`${searchStr}&pageSize=${$itemsPerPageSelector.val()}`;
      }
      // window.location.search = $.query.set('pageSize', $itemsPerPageSelector.val()).remove('pageNo');
    });
  }

  /* for IE8 */
  abcdefghijklm() {
    console.log('abcdefghijklm');
  }
}

module.exports = ZcyPagination;