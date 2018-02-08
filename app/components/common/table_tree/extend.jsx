class TableTree {

  /* 树形表格折叠功能 */
  bindTableToggleEvent() {
    var toggle = function (tr, ishide) {
      var depth = tr.attr('depth');
      for(;;){
        var btr = tr.next();
        if (0 == btr.length || (depth >= btr.attr('depth'))) {
          return;
        }
        tr = btr;
        if (true === ishide) {
          tr.addClass('hide');
          tr.find('i.icon').removeClass('icon-trianglebottom')
              .addClass('icon-triangleright');
        }
        else{
          tr.removeClass('hide');
          tr.find('i.icon').addClass('icon-trianglebottom')
              .removeClass('icon-triangleright');
        }
      }
    }

    $('table tbody').on('click', 'i.icon', function(){
      var tr = $(this).closest('tr');
      if ($(this).hasClass('icon-trianglebottom')) {
        $(this).removeClass('icon-trianglebottom')
              .addClass('icon-triangleright');
        toggle(tr, true);
      }
      else{
        $(this).addClass('icon-trianglebottom')
              .removeClass('icon-triangleright');
        toggle(tr, false);
      }
    });
    this.cutTail();
  }

  /*
    去掉最后一个节点的折叠图标 
  */
  cutTail() {
    $('table tr').each(function(){
      var tr = $(this).attr('depth');
      var btr = $(this).next().attr('depth');
      if(undefined === tr){
        return;
      }

      if (undefined === btr || (tr >= btr)) {
        $(this).find('i.icon').remove();
      }
    })
  }
}
module.exports = TableTree;