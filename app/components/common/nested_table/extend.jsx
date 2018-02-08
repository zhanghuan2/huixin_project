/*
* Nested table component
*
* Author: w0309 / wuxt@dtdream.com
* Date: 2015-12-14
*/

var TableCheckbox = require('common/table_checkbox/extend');

class NestedTable {
  constructor(selector, options) {
    var $table = $(selector);
    var config = $.extend({
      'checkbox': true,
      'childCheckbox': true,
      'expandBtn': true,
      'childExpandBtn': true,
      'onTotalChange': undefined,
      'onLineChange': undefined,
      'type': 'remote',
      'reqType': 'GET',
      'reqdata': [],
      'dataIndex': 'data'
    }, options);

    if($table.length != 1) {
      throw new Error('[NestedTable] Selector duplicates: ' + selector);
    }

    $table.addClass('nested-table');

    if(config['checkbox']) {
      this.checkboxTable = new TableCheckbox(selector, config);
    }

    // insert operation column
    if(config['expandBtn']) {
      $table.find('thead tr, tfoot tr').append('<th class="op-column"></th>');
      $table.find('tbody tr').append('<td class="nt-operation-column"><button class="nt-expand-btn"><i class="icon-zcy icon-xiangshangzhedie"></i></button></td>');
    }

    var expandedButtons = $('td.nt-operation-column > button:enabled>i').filter(".nt-expanded").parent();
    if(expandedButtons.length != 0){
      expandedButtons.each(function(){
        $(this).off('click').on('click', removeChildRows);
      });
    }
    var shrinkButtons = $('td.nt-operation-column > button:enabled>i').not(".nt-expanded").parent();
    if(shrinkButtons.length != 0){
      shrinkButtons.each(function(){
        $(this).off('click').on('click', getChildRows);
      })
    }

      // $('td.nt-operation-column > button').off('click').on('click', removeChildRows);

      // // bind events to row-expanding buttons
      // $('td.nt-operation-column > button').off('click').on('click', getChildRows);

  
    //fetch data of child rows from remote url by sending Ajax request
    function getChildRows(event){
      var here = $(this);
      here.off("click");
      console.log("into method getChildRows");
      var $parentRow  = $(this).closest('tr');
      var $currentRow = $parentRow;
      var $childRows   = [];

      var reqData = {};
      var leftBrace = config.url.indexOf('{');
      var rightBrace = config.url.indexOf('}');
      var pathVal = '';
      var url = config.url;
      var requestConfig = {
        'type': config.reqType,
        'dataType': 'JSON',
        'contentType': 'application/json',
        'success': insertChildRows,
        'error': errorHandler
      };

      if(config.type == 'remote') {

        if(!config.url) throw new Error('[NestedTable] Invalid url: ' + url);

        if((leftBrace > -1) && (leftBrace < rightBrace)) {
          pathVal = url.substring(leftBrace + 1, rightBrace);
          url = url.replace('{' + pathVal + '}', $currentRow.find('[name="' + pathVal + '"]').val());
        } else {
          $.each(config.reqData, function(index, item){
            reqData[item] = $currentRow.find('[name="' + item + '"]').val();
          })
          requestConfig['data'] = reqData;
        }

        requestConfig.url = url;
        $.ajax(requestConfig)
        .done(function(){
          here.find('.icon-zcy').toggleClass('nt-expanded', true);
          here.on('click', removeChildRows);
        })
        .fail(function(){
          here.on('click', getChildRows);
        });
      }else{
        here.find('.icon-zcy').toggleClass('nt-expanded', true);
        here.off('click').on('click', removeChildRows);
      }

      //generate child rows and insert them after the row where current clicked button locates
      function insertChildRows(data){

        var tpl = Handlebars.templates[config.template];

        if(!tpl) {
          throw new Error('Template not found: ' + config.template);
        }

        if(!(data[config.dataIndex].length)) {
          return false;
        }

        var $template    = $(tpl(data[config.dataIndex]));
        var $nestedTable = $('<table class="table table-striped nested-table p0 border-none"></table>').append($template);
        var colspan      = $template.first().find('td').length;

        if(config.childCheckbox) {
          $template.prepend('<td width="30"><input type="checkbox" name="table-line-check"></td>');
          colspan++;
        }

        if(config.childExpandBtn) {
          $template.append('<td class="nt-operation-column"></td>');  
        }

        //calculate cell width in child rows
        $currentRow.children().each(function(index, cell){
          $nestedTable.find('tr').find('td:nth-child(' + (index + 1) + ')').attr('width', ($(cell).outerWidth() || cell.width));
        });

        $childRows = $('<tr class="child-table-row"></tr>').append($('<td colspan="' + (++colspan) + '" class="p0 border-none"></td>').html($('<div class="child-table"></div>').append($nestedTable))).insertAfter($currentRow);

        config.onDataLoaded($parentRow);
      }
    }

    // remove child rows and bind expand(insert child rows) event
    function removeChildRows(event){
      console.log("into method removeChildRows");
      $(this).off('click');
      // $.each($childRows, function(index, $childRow){
      //  $childRow.remove();
      // });
      var $childRowTable = $(event.target).parents("tr").next();
      if($childRowTable.hasClass("child-table-row")){
        $childRowTable.remove();
      }
      $(this).find('.icon-zcy').toggleClass('nt-expanded', false);
      $(this).on('click', getChildRows);
    }

    function errorHandler(response){
      console.log(response);
    }

    return $table;
  }

  getCheckedLines() {
    if(config['checkbox']) {
      return this.checkboxTable.getCheckedLines();
    }

    return [];
  }
}

module.exports = NestedTable;
