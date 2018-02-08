module.exports = (function() {
  var $toggles = $('.panel.toggle-panel');
  $toggles.each(function() {
    if($(this).find('.panel-header .panel-header-btn').length > 0) {
      $($(this).find('.panel-header .panel-header-btn')[0]).before(`<span class="pull-right panel-tools panel-toggle" style="cursor: pointer;"><i class="icon-zcy icon-xiangshangzhedie"></i></span>`);
    } else {
      $(this).find('.panel-header').append(`<span class="pull-right panel-tools panel-toggle" style="cursor: pointer;"><i class="icon-zcy icon-xiangshangzhedie"></i></span>`);
    }
  });

  $toggles.find('.panel-toggle').on('click', function(event) {
    $(this).parent().siblings('.panel-body').slideToggle(300);
    var rotation = $(this).data('rotate') ? $(this).data('rotate') : 0;
    var rotation = (rotation + 180) % 360;
    $(this).data('rotate', rotation);
    $(this).animate({  borderSpacing: rotation }, {
      step: function(now,fx) {
        $(this).css('-webkit-transform','rotate('+now+'deg)');
        $(this).css('-moz-transform','rotate('+now+'deg)');
        $(this).css('transform','rotate('+now+'deg)');
      },
      duration: 300
    },'swing');
  });

  var $aside = $('.panel.aside-panel');
  if($aside.length > 0) {
    var $ref = $($aside.data('ref'));
    var margin = $aside.data('margin');
    if($ref.length == 0) $ref = $aside.parents('.js-comp');
    if(!margin) margin = 0;
    var repaintAuditPanel = function() {
      var getPanelWidth = function() {
        return $ref.width();
      }
      var left = $ref.offset().left;
      $aside.css({'width': getPanelWidth()-margin*2+'px', 'left': left+margin + 'px'});
    }
    $(window).resize(function(){
      repaintAuditPanel();
    });
    repaintAuditPanel();
    $aside.animate({'bottom': '-1px'});
  }

})();
