const server = require('zcyEvE/page/shoppingcart/server');

module.exports = {
  carSubmit (params) {
    return $.when(server.saveChangeApi(params)).then(res => res);
  },
  deleteItem (params) {
    return $.when(server.submitChangeApi(params)).then(res => res);
  }
};
