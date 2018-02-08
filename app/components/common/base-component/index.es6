/**
 * Created by chenkaixia on 2017/3/3.
 */
const  delegateEventSplitter = /^(\S+)\s*(.*)$/;
const  viewOptions = ['$el','events'];
class BaseComponent {

  constructor(options){
    _.extend(this, _.pick(options, viewOptions));
    this.cid = _.uniqueId('view');
    this.delegateEvents();
    this.initialize.apply(this, arguments);
  }

  initialize(){}

  delegateEvents(events) {
    events || (events = _.result(this, 'events'));
    if (!events) return this;
    this.undelegateEvents();
    for (var key in events) {
      var method = events[key];
      if (!_.isFunction(method)) method = this[method];
      if (!method) continue;
      var match = key.match(delegateEventSplitter);
      this.delegate(match[1], match[2], _.bind(method, this));
    }
    return this;
  }

  delegate(eventName, selector, listener) {
    this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
    return this;
  }

  undelegateEvents() {
    if (this.$el) this.$el.off('.delegateEvents' + this.cid);
    return this;
  }

  undelegate(eventName, selector, listener) {
    this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
    return this;
  }

}
module.exports = BaseComponent