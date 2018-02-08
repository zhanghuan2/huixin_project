$(document).ready(function() {
  $(document).on("input propertychange", "textarea", function() {
    var maxlength = $(this).attr("max-length");
    if (maxlength > 0) {
      var length = $(this).val().length;
      if ($(this).val().trim().length == 0) { 
        $(this).val('');
        length = 0;
      } else {
        if (length > maxlength) {
          var str = $(this).val().substring(0, maxlength);
          $(this).val(str);
          length = maxlength;
        }
      }
      $(this).siblings("span[name=textarea-counter]").remove();
      var $span = $("<span>").attr("name", "textarea-counter").html(length + "/" + maxlength)
                  .attr("style", "display:block;text-align: right;");
      if (maxlength < length) {
        $span.addClass("text-danger");
      }
      $(this).parent().append($span);
    }
  });
  $(document).on("blur", "textarea", function() {
    $(this).parent().find('[name=textarea-counter]').remove();
  })
});
