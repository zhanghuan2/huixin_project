(function($) {
  $.fn.extend({
    'timePicker': function() {
      var me = this
      var $el = $(this)
      let hour, min, sec, time

      me.init = function() {
        $el.next('.time-input-div').find('.hour ul').append(me.getLi(24))
        $el.next('.time-input-div').find('.min ul').append(me.getLi(60))
        $el.next('.time-input-div').find('.sec ul').append(me.getLi(60))

        if ($el.val() != '' && $el.val().indexOf(':') > -1) {
          hour = $el.val().split(':')[0]
          min = $el.val().split(':')[1]
          sec = $el.val().split(':')[2]
          $el.next('.time-input-div').find('.hour ul li:eq(' + hour + ')').addClass('choosed')
          $el.next('.time-input-div').find('.min ul li:eq(' + min + ')').addClass('choosed')
          $el.next('.time-input-div').find('.sec ul li:eq(' + sec + ')').addClass('choosed')
        }

        $el.on('click', function() {
          $el.next('.time-input-div').toggle()
        })

        $el.next('.time-input-div').mouseleave(function() {
          $('.time-input-div').hide()
        })

        $el.next('.time-input-div').find('.hour ul li').on('click', function() {
          $('.choosed').removeClass('choosed')
          $(this).addClass('choosed')
          hour = $(this).text()
          time = hour + ':00:00'
          $el.val(time).change().blur()
        })

        $el.next('.time-input-div').find('.min ul li').on('click', function() {
          $('.min .choosed').removeClass('choosed')
          $('.sec .choosed').removeClass('choosed')
          $(this).addClass('choosed')
          min = $(this).text()
          if (hour) {
            time = hour + ':' + min + ':00'
            $el.val(time).change().blur()
          }
        })

        $el.next('.time-input-div').find('.sec ul li').on('click', function() {
          $('.sec .choosed').removeClass('choosed')
          $(this).addClass('choosed')
          sec = $(this).text()
          if (hour && min) {
            time = hour + ':' + min + ':' + sec
            $el.val(time).change().blur()
          }
        })
      }

      me.getLi = function(_size) {
        let str = ''
        for (var i = 0; i < _size; i++) {
          if (i < 10) {
            str += '<li>0' + i + '</li>'
          } else {
            str += '<li>' + i + '</li>'
          }
        }
        return str
      }

      me.init()
      return this
    }
  })


  /**
   * example
   *
   * <div data-file="[]">
   * </div>
   *
   */

})(jQuery);