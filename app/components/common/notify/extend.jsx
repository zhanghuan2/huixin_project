var notifyTpl = Handlebars.templates["common/notify/templates/notify"]

module.exports = {
  plain: function(title, content, callback, time, needClose) {
    this.pop({type: 0, title: arguments[0], content: arguments[1], callback: arguments[2], time: arguments[3], needClose: arguments[4]})},
  success: function(title, content, callback, time, needClose) {
    this.pop({type: 1, title: arguments[0], content: arguments[1], callback: arguments[2], time: arguments[3], needClose: arguments[4]})},
  info: function(title, content, callback, time, needClose) {
    this.pop({type: 2, title: arguments[0], content: arguments[1], callback: arguments[2], time: arguments[3], needClose: arguments[4]})},
  warning: function(title, content, callback, time, needClose) {
    this.pop({type: 3, title: arguments[0], content: arguments[1], callback: arguments[2], time: arguments[3], needClose: arguments[4]})},
  error: function(title, content, callback, time, needClose) {
    this.pop({type: 4, title: arguments[0], content: arguments[1], callback: arguments[2], time: arguments[3], needClose: arguments[4]})},
  pop: function(config) {
    if(typeof config.type != 'undefined') {
      var iconClass     = [undefined, 'icon-zcy icon-notify-success text-success', 'icon-zcy icon-notify-info text-info', 'icon-zcy icon-notify-warning text-warning', 'icon-zcy icon-notify-danger text-danger'];
      config.iconClass  = iconClass[config.type];
    }

    var $notify = $(notifyTpl(config));
    var containerName = config.containerId?('#'+config.containerId):'';
    $(".notify-container" + containerName).prepend($notify);


    // bindings
    $notify.find('.notify-close').bind('click', function() {
      $notify.fadeOut(500, 'swing', function() {
        $notify.remove();
        if(config.callback) {
          config.callback({success: false});
        }
      });
    });

    $notify.fadeIn(500, 'swing');

    if(!config.needClose) {
      var timeoutMillis = config.time?config.time:2000;
      setTimeout(function () {
        $notify.fadeOut(500, 'swing', function() {
          $notify.remove();
          if(config.callback) {
            config.callback({success: true});
          }
        });
      }, timeoutMillis);
    }
  }
}
