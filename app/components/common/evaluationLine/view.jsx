class evaluationLine{
  constructor(){
    /*评价线自动定位各个分支的位置，windth-60中60是根据文字的大小决定的*/
    var width = $(".evaluationLine").width();
    var levelwidth = (width-60)/5;
    $(".level").css("margin-left",levelwidth+"px");
    var $labelpopover = $('.label-popover');
    for(var i = 0;i < $labelpopover.length;i++){
      console.log($labelpopover[i]);
      var $info = $($labelpopover[i]).children('.label-span').clone(true).show();
      $($labelpopover[i]).popover({
        placement: 'top',
        html: true,
        content: $info
      }).popover('show');
    }
  }
  
  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}
module.exports = evaluationLine;