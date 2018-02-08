module.exports = {
  getRulesApi () {
    return $.ajax({
      url: '/health/api/hall/rule/getRules',
      type: 'get'
    });
  },

  getFloorApi (params) {
    return $.ajax({
      url: '/hall/medical/floor',
      type: 'get',
      data: params
    });
  }
};
