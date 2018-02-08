let treeTlp = Handlebars.templates["common/selectric_tree/templates/tree"];

/**
 * 树形选择，值为选择的所有子节点
 */
class SelectricTree {
  constructor(selector, config) {
    let _default = {
      prefix: 'selectric-tree',
      isOpen: false,
      isTreeInit: false,
      isQuerying: false
    };
    this.nodes = '';
    this.selector = selector || null;
    this.config = $.extend(_default, config);
    this.bindEvent();

    let $treeTypeInput = this._getJqueryDom('input[data-type=tree_type]');
    let typeVal = $treeTypeInput.data('typeValue');
    this.limit = $treeTypeInput.data('limit') || -1;
    if (typeVal == 'title') {
      this.remoteUrl = '/zcy/experts/jobTitle/queryByTreeList';
    } else {
      this.remoteUrl = '/zcy/experts/bidarea/queryByTreeList';
    }

    this._preInit();
  }

  bindEvent() {
    let vm = this;
    let $tree = vm._getJqueryDom('.selectric-tree');
    $tree.click((event) => {
      vm.config.isOpen ? vm._close() : vm._open(event);
    });

    let $doc = $(document);
    $doc.on('click', () => {
      vm._close();
    });

    let $treeItem = vm._getJqueryDom('.selectric-tree-items');
    $treeItem.click((event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    $(this.selector).find('.selectric-tree .clear').off('click').on('click', function() {
      vm.deselectAll();
      vm._hideClearBtn();
    });
  }

  _showClearBtn() {
    $(this.selector).find('.selectric-tree .clear').show();
    $(this.selector).find('.selectric-tree .button').hide();
  }
  _hideClearBtn() {
    $(this.selector).find('.selectric-tree .clear').hide();
    $(this.selector).find('.selectric-tree .button').show();
  }

  _getJqueryDom(selector) {
    return this.selector ? $(this.selector).find(selector) : $(selector);
  }

  _getInput() {
    return $(this.selector).find('input[data-type="tree_type"]');
  }

  _close() {
    let vm = this;
    let $treeWrapper = vm._getJqueryDom('.selectric-tree-wrapper');
    $treeWrapper.removeClass(vm.config.prefix + '-' + 'open');
    vm.config.isOpen = false;
  }

  _open(event) {
    let vm = this;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!vm.config.isQuerying && !vm.config.isTreeInit) {
      vm._queryAndInitTree();
    }
    $(event.target).parent().parent().addClass(vm.config.prefix + '-' +'open');
    vm.config.isOpen = true;
  }

  _queryAndInitTree(callback) {
    let vm = this;
    vm.config.isQuerying = true;
    $.ajax({
      url: vm.remoteUrl,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        let $treeItem = vm._getJqueryDom('.selectric-tree-items');
        let result = data.result && data.result.length && data.result[0] || [];
        $treeItem.append(treeTlp(result.childs));
        vm._initTree($treeItem);
        callback && callback();
      }
    }).always(function(){
      vm.config.isQuerying = false;
    });
  }

  _preInit() {
    let vm = this;
    let $treeValueRoot = vm._getJqueryDom('.selectric-tree-value');
    let nodes = $treeValueRoot.find('.selectric-nodes').text();
    let names = $treeValueRoot.find('.selectric-names').text();

    /* 如果已经有值，直接写入 */
    if (nodes && names) {
      let $treeLabelRoot = vm._getJqueryDom('.' + vm.config.prefix);
      $treeLabelRoot.find('.label').text(names);
      /* 得到ids */
      vm.nodes = nodes.split(',');
    }
  }

  getValue() {
    let vm = this;
    if (!vm.tree) {
      return null;
    }
    let nodes = vm.tree.jstree(true).get_selected(true);
    if (vm.limit == 1) {
      let node = nodes[nodes.length - 1];
      return {id: node.id, text: node.text};
    }
    let ids = [];
    let texts = [];
    $.each(nodes, (index, node) => {
      ids.push(node.id);
      texts.push(node.text);
    });
    return {id: ids.join(','), text: texts.join(',')};
  }

  selectNode(obj) {
    /* 字符串 */
    let vm = this;
    let nodes = obj;
    if ($.type(obj) == 'string') {
      /* 将中文逗号转成英文 */
      obj = obj.replace(/，/g, ',');
      nodes = obj.split(',');
    }
    if (!vm.tree) {
      vm._queryAndInitTree(function() {
        /* 先清除原本的选中 */
        vm.tree.jstree('deselect_all', true);
        vm.tree.jstree('select_node', nodes);
      });
    } else {
      /* 先清除原本的选中 */
      vm.tree.jstree('deselect_all', true);
      vm.tree.jstree('select_node', nodes);
    }
  }

  deselectAll() {
    let vm = this;
    vm.tree.jstree('deselect_all', true);
    let $treeLabelRoot = vm._getJqueryDom('.' + vm.config.prefix);
    $treeLabelRoot.find('.label').text('');

    let $treeValueRoot = vm._getJqueryDom('.selectric-tree-value');
    $treeValueRoot.find('.selectric-nodes').text('');
    $treeValueRoot.find('.selectric-names').text('');

    /* 修改input的值 */
    let $input = vm._getInput();
    $input && $input.val('');
  }

  _initTree(treeRoot) {
    let vm = this;
    vm.config.isTreeInit = true;
    let plugins = vm.limit == 1 ? ['ui', 'themes', 'html_data'] : ['checkbox', 'conditionalselect', 'ui', 'themes', 'html_data'];
    vm.tree = treeRoot.jstree({
      conditionalselect: function(item, event) {
        if (vm.limit && vm.limit > 0 && this.get_checked().length >= vm.limit && !item.state.selected) {
          event.preventDefault();
          return false;
        }
        return true;
      },
      plugins : plugins,
      ui: {
        select_limit: vm.limit
      },
      core: {
        themes : {
          icons : false
        },
        dblclick_toggle : false
      },
      checkbox : {
        keep_selected_style : false
      }
    })
    .on('ready.jstree', function(event, data) {
      vm.nodes && data.instance.select_node(vm.nodes);
    })
    .on('changed.jstree', function(event, data) {
      /* 将选中的子节点值进行拼接 */
      let nodes = data.instance.get_top_selected({full: true});
      let nameArray = [];
      let idArray = [];
      $.each(nodes, (index, node) => {
        /* 去除text中的空格等字符 */
        nameArray.push($.trim(node.text));
        idArray.push(node.id);
      });
      let selectedValues = nameArray.join(',');
      let $treeLabelRoot = vm._getJqueryDom('.' + vm.config.prefix);
      $treeLabelRoot.find('.label').text(selectedValues);

      let $treeValueRoot = vm._getJqueryDom('.selectric-tree-value');
      $treeValueRoot.find('.selectric-nodes').text(idArray.join(','));
      $treeValueRoot.find('.selectric-names').text(selectedValues);

      /* 修改input的值 */
      let $input = vm._getInput();
      $input && $input.val(idArray.join(','));

      vm._showClearBtn();
    });
  }
}

module.exports = SelectricTree;
