/**
 * Created by chenkaixia on 2017/1/16.
 */


class Progress {
  constructor(params) {
    this.defaultParams={
      container:"body",
      data:[]
    };
    this.template = Handlebars.templates['common/progress/templates/view'];
    let _params = $.extend({},this.defaultParams,params);
    this.init(_params);
  }

  init(params){
    let _container = $(params.container);
    let _template =  this.template(params.data);
    _container.html(_template);
  }

}
module.exports = Progress;
