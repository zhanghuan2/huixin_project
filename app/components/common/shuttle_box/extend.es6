var Tree = {
  leftTree : undefined,
  rightTree : undefined
}
var here;
class ShuttleBox {
  constructor(config) {
    here = this;
    var _config = {
      container: undefined, 
      type: 'tree',
      selected : []
    };
    $.extend(_config, config);
    /* 初始化类型 */
    var type = _config.type;
    if ('tree' === type) {
      /* 如果树没有经过初始化 */
      if (undefined === Tree.leftTree) {
        Tree.leftTree = this.initLeftTree();
        Tree.rightTree = this.initRightTree();
      }
      else{
        Tree.leftTree.jstree().show_all(); 
        Tree.rightTree.jstree().hide_all();
        Tree.leftTree.jstree().uncheck_all();
        Tree.rightTree.jstree().uncheck_all();
        here.getTotal(Tree.rightTree);
      }
      here.disableBtnLR($('#shuttle-tree-right'), 'R2L');
      here.disableBtnLR($('#shuttle-tree-left'), 'L2R');
    }
    else if ('array' === type) {
      this.leftArray = this.initArray();      
    }
    else{
      console.log('错误类型', type);
    }

    if (0 !== _config.selected.length) {
      var tree = $('#shuttle-tree-left').jstree();
      for(let i=0;i<_config.selected.length;i++){
        tree.check_node(_config.selected[i]);
      }
      this.triggerTree('L2R');
    }
    this.initShuttleButton();
    this.bindSelectAllEven();
    return this;
  }

  initLeftTree() {
    var tree = $('#shuttle-tree-left').jstree({
      "plugins" : ["checkbox", "search", "wholerow"],
      "core": {
        "themes" : {
          "icons" : false
        },
        "dblclick_toggle" : false
      },
      /*"search": {
        "show_only_matches": true
      },*/
      "checkbox" : {
        "keep_selected_style" : false
      }
    }).bind('select_node.jstree', function (node, selected) {
      here.enableBtnLR($('#shuttle-tree-left'), "L2R");
    }).bind('deselect_node.jstree', function(){
      here.disableBtnLR($('#shuttle-tree-left'), "L2R");
    });
    $('#shuttle-tree-left').removeClass('hide');

    $('#shuttle-select-search-left').bind('input', function () {
      var key = $(this).val();
      tree.jstree().search(key);
    });
    return tree;
  }

  initRightTree() {
    var tree = $('#shuttle-tree-right').jstree({
      "plugins" : ["checkbox", "search", "wholerow"],
      "core": {
        "themes" : {
          "icons" : false
        },
        "dblclick_toggle" : false
      },
      "checkbox" : {
        "keep_selected_style" : false
      }
    }).bind('select_node.jstree', function (node, selected) {
      here.enableBtnLR($('#shuttle-tree-right'), "R2L");
    }).bind('deselect_node.jstree', function(){
      here.disableBtnLR($('#shuttle-tree-right'), "R2L");
    });
    tree.jstree().hide_all();
    tree.jstree().open_all();

    this.getTotal(tree);

    $('#shuttle-tree-right').removeClass('hide');

    $('#shuttle-select-search-right').bind('input', function () {
      var key = $(this).val();
      tree.jstree().search(key);
    });
    return tree;
  }

  /* 算一下一共有多少.. */
  getTotal(tree) {
    tree.jstree().open_all();
    tree.jstree().check_all();
    var checked = tree.jstree().get_checked();
    $('#shuttle-total-num').html(checked.length);
    /* 初始化计数 */
    $('#shuttle-unchecked-num').html(checked.length);
    $('#shuttle-checked-num').html('0');
    tree.jstree().uncheck_all();
  }

  disableBtnLR(tree, shuttle) {
    var checked = tree.jstree().get_checked();
    if ("L2R" === shuttle) {
      $('#L2R').removeClass('icon-able-l2r').addClass('icon-disable-l2r');
    }
    else if ("R2L" === shuttle) {
      $('#R2L').removeClass('icon-able-r2l').addClass('icon-disable-r2l');
    }
  
    for ( let i = 0; i < checked.length; i++ ) {
      var temp = tree.jstree().get_node(checked[i]);
      if (true !== temp.state.hidden) {   
        if ("L2R" === shuttle) {
          $('#L2R').removeClass('icon-disable-l2r').addClass('icon-able-l2r');
        }
        else if ("R2L" === shuttle) {
          $('#R2L').removeClass('icon-disable-r2l').addClass('icon-able-r2l');
        }
      }
    }
  }

  enableBtnLR(tree, shuttle) {
    var checked = tree.jstree().get_checked();
    if (0 !== checked.length) {
      if ("L2R" === shuttle) {
        $('#L2R').removeClass('icon-disable-l2r').addClass('icon-able-l2r');
      }
      else if ("R2L" === shuttle) {
        $('#R2L').removeClass('icon-disable-r2l').addClass('icon-able-r2l');
      }
      else {
        $('#L2R').removeClass('icon-disable-l2r').addClass('icon-able-l2r');
        $('#R2L').removeClass('icon-disable-r2l').addClass('icon-able-r2l');
      }
    }
  }

  /* 左右穿梭按钮 */
  initShuttleButton () {
    var that = this;

    $('#L2R').unbind().bind('click', function () {
      if ($(this).hasClass("icon-able-l2r")) {
        that.triggerTree('L2R');
        here.disableBtnLR($('#shuttle-tree-left'), 'L2R');
        here.disableBtnLR($('#shuttle-tree-right'), 'R2L');
      }
    });
    
    $('#R2L').unbind().bind('click', function () {
      if ($(this).hasClass("icon-able-r2l")) {
        that.triggerTree('R2L');
        here.disableBtnLR($('#shuttle-tree-right'), 'R2L');
        here.disableBtnLR($('#shuttle-tree-left'), 'L2R');
      }
    });
  }

  triggerTree(shuttle) {
    var masterTree, slaveTree;
    
    if ('L2R' === shuttle) {
      masterTree = $('#shuttle-tree-left').jstree();
      slaveTree = $('#shuttle-tree-right').jstree();
    } 
    else if ('R2L' === shuttle) {
      masterTree = $('#shuttle-tree-right').jstree();
      slaveTree = $('#shuttle-tree-left').jstree();
    }
    else {
      console.log('错误类型', shuttle);
    }

    var checked = masterTree.get_checked();
    for ( let i = 0; i < checked.length; i++ ) {
      var temp = slaveTree.get_node(checked[i]);
      slaveTree.show_node(temp);
      slaveTree.show_node(temp.parents);
      masterTree.hide_node(temp);
    }

    var selected = this.getSelected();
    var total = Number($('#shuttle-total-num').html());
    var selectedLen = selected.length;
    var unSelectedLen = total - selectedLen;
    $('#shuttle-unchecked-num').html(unSelectedLen);
    $('#shuttle-checked-num').html(selectedLen);
  }

  /* 全选按钮 */
  bindSelectAllEven() {
    $(".select-all").unbind().bind('click', function () {
      /* name 放的是树id */
      var name = $(this).attr('name');
      $('#'+name).jstree().select_all();
      here.enableBtnLR($('#'+name), ('shuttle-tree-left' === name)?'L2R':'R2L');
    });
  }
  getSelected () {
    var tree = $('#shuttle-tree-left').jstree();
    var checked = tree.get_checked();
    var result = [];
    for ( let i = 0; i < checked.length; i++ ) {
      var temp = tree.get_node(checked[i]);
      if (true === temp.state.hidden &&　(true === tree.is_leaf(temp))) {      
        var node = {
          id : temp.id,
          name : temp.text,
          leaf : true
        };
        result.push(node);
      }
    }
    return result;
  }
  getSelectedOrphan () {
    var tree = $('#shuttle-tree-left').jstree();
    var checked = tree.get_checked();
    var result = [];
    for ( let i = 0; i < checked.length; i++ ) {
      var temp = tree.get_node(checked[i]);
      if (true === temp.state.hidden) {
        var parentNode = tree.get_node(tree.get_parent(temp));
        if (false === parentNode.state.hidden || null == parentNode.state.hidden ) {
          var node = {
            id : temp.id,
            name : temp.text,
            leaf : tree.is_leaf(temp)
          };
          result.push(node);  
        }
      }
    }
    return result;
  }
}

module.exports = ShuttleBox;