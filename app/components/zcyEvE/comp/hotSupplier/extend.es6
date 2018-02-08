import FavoriteShop from 'favorite_shop/view'
const template = Handlebars.templates["zcyEvE/hotSupplier/templates/supplierListT"]
const PaginationClass = require('pokeball/components/pagination')
class supplierList {
  constructor() {
    this.beforeRander()
    this.$container = $(".root-container")
  }
  beforeRander(){
    let that = this,
        param = {}
    param.name = $.query.get("name")
    param.tags = $.query.get("tags")
    $.ajax({
      url: "/api/portal/mfacture/shops?pageSize=200",
      type: "GET",
      data:param,
      success:function(data){
        if(data){
          that.render(data);
          that.init();
          that.bindEvent();
          that.afterRender();
        }
      }
    })
  }
  afterRender () {
    let hasLogin = $('#isPurchaser').data('user')
    if (!hasLogin) {
      return
    }
    let shopIds = []
    $('a.js-add-favor').each((i, e) => {
      let shopId = $(e).data('shopId')
      if (shopId) {
        shopIds.push(shopId)
      }
    })
    FavoriteShop.getShopsFollowStatus(shopIds, (result) => {
      $('a.js-add-favor').each((i, e) => {
        let shopId = $(e).data('shopId')
        if (result[shopId]) {
          $(e).replaceWith('<label>已关注店铺</label>')
        }
      })
    })
  }
  render(data){
    // let isPurchaser = $('#isPurchaser').val()
    let DATA = {
      _DATA_:data
      // isPurchaser
    };
   let html = template(DATA);
    $(".detail-box").html(html);
  }
  init(){
   let searchName =  $.query.get("name")
      $(".jSearchName").val(searchName)
    if( $.query.get("tags") && $.query.get("tags").length > 0){
      $("input[name='labelType']").each(function(){
        let _index = $.query.get("tags").indexOf($(this).data("type"))
        if(_index > -1){
          $(this).prop("checked",true)
        }
      })
    }
    let supplierDom = $(".component-supplierList .supplier-name-show");
    $.each(supplierDom,function(i,v){
      let name = $(this).data("name");
      $(this).html(name);
    });
  }
  bindEvent(){
    $(".jsSupplierTitle").on("mouseover mouseout", (event) => {
      const $parent = $(event.target).hasClass("supplier-title") ?
        $(event.target) :
        ($(event.target).parents(".supplier-title"));
      if (event.type == "mouseover") {
        $parent.parent().find(".supplier-mask").removeClass("hide");
      } else if (event.type == "mouseout") {
        $parent.parent().find(".supplier-mask").addClass("hide");
      }
    })
    $(".jsSupplierTitle").find(".logo-img-box,.supplierName").on("click",function(){
      let id = $(this).parents(".supplier-title").find(".shopidSave").val()||0;
      location.href = "/search?searchType=1&shopId="+id
    });
    this.totalItems = $('.pagination').data('total')
    this.pagination = new PaginationClass('.pagination').total(this.totalItems).show($('.pagination').data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true
    })
    $(".component-supplierList").find(".supplier-msg .icon-detailqq").on("click",function(e){
      let qqid = $(this).parent().parent().find(".qqSave").val();
      if(!qqid){
        return;
      }
      let qqidObj = qqid.split(",")[0];
      let idNumber = qqidObj.split(":")[1];
      let site = $(".component-supplierList").find(".hrefmain").val();
      if(idNumber && idNumber !== ""){
        window.open("http://wpa.qq.com/msgrd?V=3&uin="+idNumber+"&Site="+site+"&Menu=yes");
      }
    })
    // 热卖商品点击跳转
	  this.$container.find(".supplier-link").on("click", function () {
		  const $dom = $(this).find("div.link-info");
		  const _id = $dom.data("linkid");
		  let frontUrl = $('input[name="frontUrl"]').val();
		  location.href = frontUrl + "/items/" + _id + "?searchType=1"
	  })
    //关注店铺
    $('.js-add-favor').off().on('click', (evt) => {
      $(evt.currentTarget).hide()
      let shopId = $(evt.currentTarget).data('shopId')
      if (shopId) {
        FavoriteShop.followShops([shopId], () => {
          $(evt.currentTarget).replaceWith('<label>已关注店铺</label>').show()
        }, () => {
          $(evt.currentTarget).show()
        })
      }
    })

  }
}
module.exports = supplierList;
