module.exports = function() {
  var dc = require("common/dc/dc");
  $(".attachmentDelete").unbind().bind('click',function(){
    $(this).parent().remove();
  });

  $(".attachmentName").unbind().bind('click',function(){
    var fileId = $(this).next().next().val();
    var dcTemp = new dc();
    dcTemp.download("/api/supplier/attachment/downloadUrl",fileId);
  });
};