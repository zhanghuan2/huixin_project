module.exports ={

  bindKeyup: function(_selector){
    if (_selector==null) {
      _selector="";
    }
    var $container = $(_selector);

    $container.find("input[maxlength]").unbind('keyup').bind('keyup', function(){
      this.maxlengthCheck(this);
    });
  },

  maxlengthCheck: function(_object){
    var maxlength = $(_object).attr("maxlength"); 
    if(_object.value.replace(/[^\x00-\xff]/g,"**").length>= 20){
      var textIndex = 0;
      var index = 0;
      var str = $(_object).val();
      for(var c in str){
        /* 判断本字符是否为中文 */
        var regu =/^[^\x00-\xff]$/;
        var re = new RegExp(regu);
        if(re.test(str[c])){
          index ++;
          textIndex += 2;
          if (textIndex>=maxlength) {
            if (textIndex>maxlength){
              index --;
              textIndex -= 2;
            }
            break;
          }
        }else{
          index ++;
          textIndex += 1;
          if (textIndex>=maxlength) {
            break;
          }
        }
      }
      $(_object).val($(_object).val().substring(0,index)); 
    }
  } 

};