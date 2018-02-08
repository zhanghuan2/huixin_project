/*
  商品主搜组件
 */

import Modal from "pokeball/components/modal"
import Pagination from "pokeball/components/pagination"
import Tip from "common/tip_and_alert/view"
import Language from "locale/locale"
import Cookie from "common/cookie/view"
const AddressGroup = require("common/address_select_group/view")
const itemServices = require('common/item_services/view')
const Query = require('common/query/extend')

const itemCompareTemplate = Handlebars.templates["zcyEvE/comp/goods_search/templates/item-compare"]
const searchTemplate = Handlebars.templates["zcyEvE/comp/goods_search/templates/search"]
const categoryListTemplate = Handlebars.templates["zcyEvE/comp/goods_search/templates/category-list"]
const goodsListTemplate = Handlebars.templates["zcyEvE/comp/goods_search/templates/goods-list"]
const addToCartForm = Handlebars.templates["zcyEvE/comp/goods_search/templates/add-to-cart-form"]
const otherAttrSearch = Handlebars.templates["zcyEvE/comp/goods_search/templates/other-attr-search"]
// const addressSelectDown = Handlebars.templates["zcyEvE/comp/goods_search/templates/address-select-down"]

class GoodsList extends AddressGroup {

  constructor() {
    super()

    //?用户类型
    this.userType = $('body').data('user-type');
    this.query = new Query();
    this.search = "";  
    //？ isshop
    this.pageSize = 50;
    
    this.newJsonSearch = {
      limit:50,
      offset:1,
      tradeType:0,
      brandIds:[],
      fcids:[],
      high_price:"",
      low_price:"",
      sorts:[],
      q:""
    };
    this.urlPrefix = '/hall/medical/main/search';
    this.render();
    
  }

  render(){
    let self = this;
    this.getInitData();//初始化页面
    // ?初始化后。。
    $('.component-goods-supplierSearch-list').off('categorySearch').on('categorySearch', () => {
      this.getSearchData(this.newJsonSearch, "category");
    });

    // window.onscroll = function(){
    //   if(!self.isShop){  // 商品搜索页才显示固定筛选条
    //     var ht = document.documentElement.scrollTop || document.body.scrollTop;
    //     if(ht > 470){
    //       $(".fix-nav-bar").removeClass('hide');
    //       // 固定于顶部的搜索栏 的相关事件绑定
    //       $('.fix-nav-bar #search-button').off('click').on('click', (evt) => {   // 搜索
    //         let target = $(evt.currentTarget);
    //         $('.input-group .search-input').val( target.siblings('.search-input').val().trim() );
    //         $('.input-group #search-button').trigger('click');
    //       });
    //       $('.fix-nav-bar .js-item-brands').off('click').on('click', (evt)=> {    // 品牌
    //         $('.goods-search-list .js-item-brands').trigger('click');
    //       });
    //       $('.fix-nav-bar .js-item-agreementPrice').off('click').on('click', (evt)=> {    // 协议价
    //         $('.goods-search-list .js-item-agreementPrice').trigger('click');
    //       });
    //       $('.fix-nav-bar .js-filter-submit').off('click').on('click', (evt)=> {   // 价格区间筛选
    //         $('.goods-search-list input.p_f').val( $('.fix-nav-bar input.p_f').val().trim() );
    //         $('.goods-search-list input.p_t').val( $('.fix-nav-bar input.p_t').val().trim() );
    //         $('.goods-search-list .js-filter-submit').trigger('click');
    //       });
    //       $('.fix-nav-bar .js-filter-clear').off('click').on('click', (evt)=> {    // 清除价格区间筛选
    //         $('.fix-nav-bar input.p_f').val('');
    //         $('.fix-nav-bar input.p_t').val('');
    //         $('.goods-search-list .js-filter-clear').trigger('click');
    //       });
    //       $('.fix-nav-bar .js-tradeType').off('click').on('click', (evt)=> {   // 交易方式
    //         $('.goods-search-list .js-tradeType').val( $('js-tradeType').val("全部"));
    //         $('.goods-search-list .js-filter-submit').trigger('click');
    //       });
    //     }
    //     else{
    //       $(".fix-nav-bar").addClass('hide');
    //     }
    //   }
    // }
  }

  // 渲染搜索结果数据  公共方法
  getSearchData(newJsonSearch, type){
    let self = this;
    $('.wc-spin').removeClass('hide');
    $.ajax({
      url:'/hall/medical/search',
      data: JSON.stringify(newJsonSearch),
      type: "POST",
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      error: (jqXHR) => {
        $('.wc-spin').addClass('hide');
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: jqXHR.responseText
        }).show();
      }
    }).done((data)=>{
      $('.wc-spin').addClass('hide');
      $('.total span').text(data.total);
      $('.custom-total').text(self.getPageSize(data.total,self.pageSize));
      data.pageSize = self.pageSize;
      $(".goods-list").empty().append(goodsListTemplate(data));
      // 切换到当前的视图模式
      let modeType = $('.view-mode .active').data('type');
      $('.list').removeClass('view-thumb view-list').addClass('view-' + modeType);
      if(type == "category"){
        $(".category-list").empty().append(categoryListTemplate(data));
      }
      self.bindGoodsListEvent();
      self.imageLazyLoad();
      if(type == "category") {
        self.bindCategoryListEvent();
      }
      self.init();
    });
  }
  
  getPageSize(total,size){
    let calcPageSize = Math.floor(total / size );
    if(total % size >0){
      calcPageSize++
    }
    if(calcPageSize == 0){
      calcPageSize = 1;
    }
    return calcPageSize
  }

  // 抽象初始化函数 与采购方式合并函数 同为第一次加载
  getInitDataAbstract(searchContent){
    let self = this;
    let searchJson = "", searchUrl, searchType = "GET";
    if(typeof(searchContent) === "object"){
      searchJson = JSON.stringify(searchContent);
      searchUrl = "/hall/medical/search";
      searchType = "POST";
    }else{
      searchJson = "";
      searchUrl = self.urlPrefix + searchContent;
    }
    $('.wc-spin').removeClass('hide');
      $.ajax({
        url: searchUrl,
        data: searchJson,
        type: searchType,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        error: (jqXHR) => { 
          $('.wc-spin').addClass('hide');
          new Modal({
            title:'温馨提示',
            icon:'info',
            content: jqXHR.responseText
          }).show();
        }
      }).done((data) => {
        $(".js-search-list").empty().append(searchTemplate(data));
        $('.total span').text(data.total);
        $('.custom-total').text(self.getPageSize(data.total,self.pageSize));
        $(".category-list").empty().append(categoryListTemplate(data));
        //给返回数据添加pageSize
        data.pageSize = self.pageSize;
        $(".goods-list").empty().append(goodsListTemplate(data));
        $(".js-has-goods").prop('checked', true);

        self.bindEvent();
        self.bindCategoryListEvent();
        self.bindGoodsListEvent();
        self.imageLazyLoad();
        self.init();
      });
  }

  // 页面初始化渲染
  getInitData(){
    let self = this;
    let searchQ = "", searchFcid = "";
    //从url中获取首页的q
    let searchQ_get = this.query.get("q");
    if(searchQ_get == "undefined" || searchQ_get == undefined){
    }else{
      searchQ = "?q=" + searchQ_get;
      this.newJsonSearch.q = searchQ_get;
    }

    //从url中获取 首页的类目fcid
    let searchFcid_get = this.query.get("categoryId");
    let reg = /^[0-9]+$/;
    if (!reg.test(searchFcid_get)){
    }else{
      searchFcid = "?fcid=" + searchFcid_get;
      this.newJsonSearch.fcids.push(searchFcid_get);
    }

    //从url中获取 首页的类目采购方式 值为1或者2
    let searchTrade_get = parseInt(this.query.get("tradeType"));
    if(searchTrade_get === 1){
      this.newJsonSearch.tradeType = 1;
    }else if(searchTrade_get === 2){
      this.newJsonSearch.tradeType = 2;
    }else{
    }


    if(reg.test(searchFcid_get)){
      this.getInitDataAbstract(searchFcid);
    }else if(this.newJsonSearch.tradeType !== 0){
      //第一次加载要渲染category
      this.getInitDataAbstract(this.newJsonSearch);   
      //改变search中交易方式的状态见bindCategoryListEvent()
    }
    else{
      this.getInitDataAbstract(searchQ);   
      $('.J_search-input').val(this.newJsonSearch.q);
    } 
  }

  // 商品图片懒加载
  imageLazyLoad(){
    $('.component-goods-supplierSearch-list').find('img.lazy').lazyload({
      placeholder: '',
      effect: "fadeIn",
      skip_invisible: false
    }).removeClass("lazy");
  }
  
  getPageNo(){
    return parseInt(this.newJsonSearch.offset);
  }

  getDomElems() {
    // 商品筛选
    this.$jsSort = $('.js-sort');
    this.filterForm = $(".goods-search-list .js-price-range");
    this.$jsFilterTradeType=$(".js-tradeType");
    this.$jsPriceInput = $('.js-price-range input');
    this.$jsPriceSubmit = $('.goods-search-list .js-filter-submit');
    this.$jsFilterClear = $('.goods-search-list .js-filter-clear');
    // 商品对比
    this.compareBtn = ".anon-contrast";
    this.closeCompare = ".close-compare-module";
    this.emptyProduct = ".empty-compare-product";
    this.jsDelectSelected = ".js-delect-selected";
  }

  // 绑定商品筛选和商品对比事件 加交易方式
  bindEvent() {
    this.getDomElems();
    // 自定义分页
    $('.custom-prev').on("click", function(){
      $('.prev').trigger("click");
    });
    $('.custom-next').on("click", function(){
      $('.next').trigger("click");
    });
    let currentPage = $('.current').text();
    $('.custom-pageNo').text( (currentPage == "") ? 1 : currentPage);

    // 商品对比
    // $(this.closeCompare).on("click", this.compareClose);
    // $(this.emptyProduct).on("click", this.productEmpty);
    // $(this.compareBtn).on("click", this.btnCompare);
    // $(document).on("click", this.jsDelectSelected, (evt) => this.deletelItemCompareId(evt));
    // 按照 品牌，协议价，排序
    this.$jsSort.delegate("button", "click", (evt) => this.goodsSort(evt));
    //? 价格区间筛选
    this.$jsPriceInput.on('click', (evt) => {
      evt.stopPropagation();
      $('.js-price-filter').removeClass('hide');
    });
    $(document).on('click', (evt) => {
      let target = $(evt.currentTarget);
      if(!target.hasClass('p_f') && !target.hasClass('p_t') && !target.hasClass('js-filter-submit') && !target.hasClass('js-filter-clear')) {
        $('.js-price-filter').addClass('hide');
      }
    });

    this.$jsFilterTradeType.on("change",(evt)=>this.FilterTradeType(evt));
    this.$jsPriceSubmit.on('click', (evt) => this.priceRangeFilter(evt));
    this.$jsFilterClear.on('click', (evt) => this.cancelPriceFilter(evt));
    this.filterForm.validator({
      isErrorOnParent: true
    });
  };

  // 绑定其他选项事件
  bindOtherAttrEvent() {
    $(".more-options").on("click", (evt) => this.electsBrands(evt));
    $(".js-brand-cancel").off('click').on("click", (evt) => this.brandCancel(evt));
  }

  getCategoryListElems() {
    // this.breadPropertySelector = $(".js-bread-property-selector");
    this.breadCategorySelector = $(".js-bread-category-selector");
    this.breadBrandSelector = $(".js-bread-brand-selector");
    // this.breadPlanSelector = $(".js-bread-plan-selector");
    this.brandSelector = $(".js-brand-selector");
    this.otherAttrSelector = $(".js-other-attr-selector");
    this.$jsPrintSearchPrint = $(".js-print-search-result");
    this.$jsFilterToggle = $('.js-filter-toggle');
    this.$jsElects = $(".more-options");
    this.$jsBrandConfirm = $(".js-brand-confirm");
    this.$jsBrandCancel = $(".js-brand-cancel");
    this.$jsMoredd = $(".js-more-dd");
    // this.jsCancelProperty = $(".bread-selector");
    //? 
    this.isUser = $(".current-location-dark").data("user");
    this.$jsTradeType=$(".js-tradeType");
  }

  // 绑定头部类别筛选事件
  bindCategoryListEvent() {
    this.getCategoryListElems();
    // this.breadPropertySelector.on("click", (evt) => this.breadPropertySelectorClick(evt));
    this.breadCategorySelector.on("click", (evt) => this.breadCategorySelectorClick(evt));
    this.breadBrandSelector.on("click", (evt) => this.breadBrandSelectorClick(evt));
    // this.breadPlanSelector.on("click", (evt) => this.breadPlanSelectorClick(evt));
    this.brandSelector.on("click", (evt) => this.brandSelectorClick(evt));
    this.otherAttrSelector.on("mouseleave", (evt) => this.hideAttrSelector(evt))
    this.$jsPrintSearchPrint.on("click", (evt) => this.printSearchResult(evt));
    this.$jsFilterToggle.on("click", (evt) => this.filterToggle(evt));
    this.$jsElects.on("click", (evt) => this.electsBrands(evt));
    this.$jsBrandConfirm.on("click", (evt) => this.brandConfirm(evt));
    this.$jsBrandCancel.on("click", (evt) => this.brandCancel(evt));
    this.$jsMoredd.on("click", (evt) => this.categoriesMore(evt));
    // this.jsCancelProperty.on("click", this.cancelBreadProperty());
    this.$jsTradeType.selectric();
    //更换采购方式的选中状态
    this.$jsTradeType.prop("selectedIndex",this.newJsonSearch.tradeType).selectric("refresh");

    //  测试一下
    $('.list-more input').on('click', (evt) =>{
      let target = $(evt.currentTarget);
      let thisDl = target.closest("dl");
      if( thisDl.find('.list-more').find('input:checked').length > 0 ){
        target.closest('dl').find('.js-brand-confirm').prop('disabled',false);
        target.closest('dl').find('.js-attrs-confirm').prop('disabled',false);
      }else {
        target.closest('dl').find('.js-brand-confirm').prop('disabled',true);
        target.closest('dl').find('.js-attrs-confirm').prop('disabled',true);
      }
    });
  }

  getGoodsListElems() {
    this.viewModeType = $('.view-mode-type');
    this.viewModeTableTrs = $('.view-mode-list tbody tr');
    this.timer = null;
    this.product = $('.product');
    this.$addToCart = $(".addToCart");
    this.selectCompare = $(".js-compare-checkbox");
  }

  // 绑定商品列表事件,添加参数
  bindGoodsListEvent(){
    let self = this;
    this.getGoodsListElems();
    let pagination;
    pagination = new Pagination(".js-pagination").total($('.total span').text()).show($(".js-pagination").data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true,
      current_page: self.getPageNo() - 1,
      callback: function(pageNo, pageSize) {
        self.newJsonSearch.limit = pageSize;
        self.newJsonSearch.offset = pageNo + 1;
        self.pageSize = pageSize;
        self.getSearchData(self.newJsonSearch, "filter");
        return true;
      }
    });
    let currentPage = $('.current').text();
    $('.custom-pageNo').text( (currentPage == "") ? 1 : currentPage);
    // 加入对比
    this.selectCompare.on("click", (evt) => this.itemSelectId(evt));
    $('.compare-checkbox').on("change", (evt) => this.itemSelectId(evt));

    // 切换 大图/列表 视图
    this.viewModeType.on("click", this.changeViewMode);
    // 显示加入购物车和对比按钮。 并请求可用采购计划数
    // this.product.on('mouseenter', (evt) => this.showOperationItem(evt));
    // this.product.on('mouseleave', (evt) => this.hideOperationItem(evt));
  }

  //?
  getAddToCartElems() {
    this.$goodsAttr = $('.goods-attr');
    this.$addToCartSubmit = $('.addToCartSubmit');
    this.$addToCartCancel = $('.addToCartCancel');
  }

  //? 加入购物车表单相关事件
  bindAddToCartEvent() {
    this.getAddToCartElems();
    // 更新选中商品属性的样式
    this.$goodsAttr.delegate("input", 'click', (evt) => this.selectedGoodsAttr(evt));
    // 提交 加入购物车
    this.$addToCartSubmit.on('click', (evt) => this.addToCartSubmit(evt));
    // 取消 加入购物车
    this.$addToCartCancel.on('click', (evt) => this.hideAddToCartForm(evt));
  }

  init() {
    //? 同步商品对比信息
    // return this.asncGet();
  };

  // 提交 加入购物车
  addToCartSubmit(evt) {
    let target =  $(evt.currentTarget);
    let temp = {};
    let skuList = target.closest('.addToCartForm').find('.sku-list').data('skulist');
    let stockMap = target.closest('.addToCartForm').find('.sku-list').data('stockMap');
    let skuId;
    target.parents('.tooltips').find('input.selected').each(function(){
      let attrkey = $(this).data('attrkey');
      let val = $(this).val();
      temp[attrkey] = val;
    });

    for(let k=0; k<skuList.length; k++){
      let attrs = skuList[k].attrs;
      let flag = false;
      for(let i=0; i<attrs.length; i++){
        if(temp[attrs[i].attrKey] != attrs[i].attrVal){
          break;
        }
        if(i == attrs.length-1){
          flag = true;
        }
      }
      if(flag) {
        skuId = skuList[k].id;
        break;
      }
    }

    //库存不足时给出提示
    if (!stockMap[skuId] || stockMap[skuId] < 1) {
      new Modal({
        icon: 'info',
        title: '温馨提示',
        content: '请勾选您需要的商品信息！'
      }).show()
      return
    }

    let _data = "skuId=" + skuId + "&quantity=1";
    //$('.js-search-list').spin(false);
    //$('.js-search-list').spin('large');
    //$('.js-search-list').overlay({'backgroundColor':'#eee'});
    $('.wc-spin').removeClass('hide');

    $.ajax({
      async: false,
      url: "/api/zcy/carts",
      type: "PUT",
      data: _data,
      error: (jqXHR) => {
        //$('.js-search-list').spin(false);
        $('.wc-spin').addClass('hide');
        new Modal({
          title:'温馨提示',
          icon:'error',
          content: jqXHR.responseText
        }).show();
      }
    }).done((data)=>{
      //$('.js-search-list').spin(false);
      $('.wc-spin').addClass('hide');
      new Modal({
        title:'温馨提示',
        icon:'success',
        content: '加入购物车成功！'
      }).show();
      target.closest('.tooltips').addClass('hide');
      target.closest('.product').removeClass('hovered');
    });
  }

  //? 更新选中商品属性的样式
  selectedGoodsAttr(evt) {
    let item =  $(evt.currentTarget);
    if(item.hasClass('selected')){
      item.removeClass('selected');
    }
    else {
      item.addClass('selected');
    }
    item.siblings().each(function(){   // 实现单选
      if($(this).hasClass('selected')){
        $(this).removeClass('selected');
      }
    });
  }

  // 显示加入购物车表单
  showAddToCartForm(evt) {
    let self = this;
    let item =  $(evt.currentTarget);
    let productId = item.parents('.product').data('id');
    let leafRegion = Cookie.getCookie('aid') || '330102';

    if(this.userType == "") {   // 用户未登录, 点击加入购物车按钮后，跳转到登录页面
      window.location.href = '/login';
      return;
    }

    $.ajax({
      url: '/api/zcy/items/findSkuAndStock?itemId=' + productId + '&leafRegion=' + leafRegion,
      type: 'GET'
    }).done((data)=>{
      if(data.result.skus.groupedSkuAttrs.length > 0){
        item.siblings('.addToCartForm').empty().append(addToCartForm(data));
        self.bindAddToCartEvent();
        item.siblings('.tooltips').removeClass('hide').slideDown('slow');
      }
      else {   // 商品无sku, 直接提交 加入购物车
        let skuId = data.result.skus.skus[0].id;
        let _data = "skuId=" + skuId + "&quantity=1";
        $('.wc-spin').removeClass('hide');
        $.ajax({
          async: false,
          url: "/api/zcy/carts",
          type: "PUT",
          data: _data,
          error: (jqXHR) => {
            $('.wc-spin').addClass('hide');
            new Modal({
              title:'温馨提示',
              icon:'error',
              content: jqXHR.responseText
            }).show();
          }
        }).done((data)=>{
          $('.wc-spin').addClass('hide');
          new Modal({
            title:'温馨提示',
            icon:'success',
            content: '加入购物车成功！'
          }).show();
        });
      }
    });
  }

  // 隐藏加入购物车表单
  hideAddToCartForm(evt) {
    let item =  $(evt.currentTarget);
    item.closest('.tooltips').addClass('hide');
    item.closest('.product').removeClass('hovered');
  }

  // 显示 加入购物车和对比菜单栏 + 请求可用采购计划数
  showOperationItem(evt) {
    let item =  $(evt.currentTarget);
    item.find('.addToCart').removeClass('disabled').attr('disabled', false);  // set to default
    if(this.userType === 2 || this.userType === 0){   // 供应商 或者 admin , 加入购物车按钮置灰
      item.find('.addToCart').addClass('disabled').attr('disabled', true);
    }
    item.find('.product-cart').removeClass('hide');
  }

  // 隐藏 加入购物车和对比菜单栏
  hideOperationItem(evt) {
    // let item =  $(evt.currentTarget);
    // let productCart = item.find('.product-cart');
    // let tooltips = item.find('.product-cart .tooltips');
    // if(tooltips.hasClass('hide')){   // 还未点击加入购物车按钮
    //   productCart.addClass('hide');
    // }
    // else {
    //   item.addClass('hovered');
    // }
  }

  changeCompare(leng, data) {
    $.each(data, (function(_this) {
      return function(i, d) {
        return $(".compare-checkbox[value='" + d + "']").prop("checked", true);
      };
    })(this));
    if (leng >= 1) {
      $(".js-select-product").removeClass("hide");
      if (leng > 1) {
        return $(".select-function").removeClass("hide-mydefine");
      } else {
        return $(".select-function").addClass("hide-mydefine");
      }
    } else {
      $(".js-select-product").addClass("hide");
      return $(".select-function").addClass("hide-mydefine");
    }
  };

  // 商品对比
  compareCommon(data) {
    let i, itemIds, j, leng, ref, result;
    result = [];
    leng = data.length;
    itemIds = JSON.stringify(data);
    this.changeCompare(leng, data);
    for (i = j = ref = leng; ref <= 4 ? j < 4 : j > 4; i = ref <= 4 ? ++j : --j) {
      result.push(i + 1);
    }
    if (data.length > 0) {
      return $.ajax({
        url: "/api/zcy/compare/itemPropertyCompare",
        type: "GET",
        data: "itemIds=" + itemIds
      }).done((data)=>{
        data["result"] = result;
        $(".product-contrast-select .js-select").remove();
        $(".product-contrast-select .js-noselect").remove();
        return $(".product-contrast-select").append(itemCompareTemplate({
          data: data
        }));
      });
    }
  };

  // 同步商品对比信息
  asncGet() {
    return $.ajax({
      //?url
      url: "/hall/medical/items/compare/getItemCompareIds",
      type: "GET",
      success: (function(_this) {
        return function(data) {
          _this.compareCommon(data);
          $('.js-compare-checkbox').removeClass('cancleCompare').find('.content').text('对比');
          $.each(data, function(i, d){
            $('#'+d).addClass('cancleCompare').find('.content').text('取消对比');
            $(".compare-checkbox[value='" + d + "']").prop("checked", true);
          });
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return new Modal({
            title: "温馨提示",
            icon: "info",
            content: "获取对比商品失败"
          }).show();
        };
      })(this)
    });
  };

  // 设置商品对比所需的ItemId
  setItemCompareId(evt, itemId) {
    return $.ajax({
      url: "/api/zcy/items/compare/setItemCompareId",
      type: "POST",
      data: {
        itemId: itemId
      },
      success: (function(_this) {
        return function(data) {
          if (data === false) {
            let target = $(evt.currentTarget);
            let itemId = target.data("itemid");
            $(".compare-checkbox[value='" + itemId + "']").prop("checked", false).parents("tr").removeClass("checked-style");
            $("#"+itemId).removeClass('cancleCompare').find('.content').text('对比');
            return;
          } else {
            $(".js-select-product.hide").removeClass("hide");
            return $.get("/api/zcy/items/compare/getItemCompareIds", function(el) {
              _this.compareCommon(el);
              return $.each(el, function(i, d) {
                return $(".compare-checkbox[value='" + d + "']").prop("checked", true);
              });
            });
          }
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return new Modal({
            title: '温馨提示',
            icon: 'info',
            content: data.responseText
          }).show(function() {
              let target = $(evt.currentTarget)
              target.find('.content').text('对比');
              target.removeClass('cancleCompare');
              return target.prop("checked", false);
          });
        };
      })(this)
    });
  };

  // 切换视图模式
  changeViewMode(evt) {
    let $target, modeType;
    $target = $(evt.target);
    if($target.prop("tagName").toLowerCase() == "i"){
      $target = $target.parent();
    }
    modeType = $target.data('type');
    $target.addClass('active').siblings().removeClass('active');
    $.query = $.query.set('mode', modeType);
	  // 保留列表tr被选中状态
	  if(modeType == "list"){
		  $(".compare-checkbox:checked").each(function(){
			  $(this).parents("tr").addClass("checked-style")
		  })
	  };
    return $('.list').removeClass('view-thumb view-list').addClass('view-' + modeType);
  };

  removeSortActive($elem){
    if($elem.hasClass('active')){
      $elem.removeClass('active');
      $elem.find('i.active').each(function(){
        $(this).removeClass('active');
      });
    }
  }

  // 品牌排序样式同步
  itemBrandsCssSync($target, sorts) {
    let trianglebottom = $target.find('.icon-trianglebottom');
    if(trianglebottom.hasClass('active')){    //  不排序
      $target.removeClass('active');
      trianglebottom.removeClass('active');
      // if(sorts[0] = undefined){
      //   sorts[0]="";
      // }
      sorts[1]="brandName≈asc";
    }
    else {      // 品牌增序
      $target.addClass('active');
      trianglebottom.addClass('active');
      // if(sorts[0] = undefined){
      //   sorts[0]="";
      // }
      sorts[1]="brandName≈desc";
    }
    // 移除其他按钮的样式
    this.removeSortActive( $target.siblings('.js-item-agreementPrice') );
  }

  // 协议价 排序样式同步
  itemAgreementPriceCssSync($target, sorts) {
    $target.addClass('active');
    let triangleup = $target.find('.icon-triangleup');
    let trianglebottom = $target.find('.icon-trianglebottom');
    if(triangleup.hasClass('active')){    // 从高到低
      triangleup.removeClass('active');
      trianglebottom.addClass('active');
     
      // if(sorts[0] = undefined){
      //   sorts[0]="";
      // }
      // if(sorts[1] = undefined){
      //   sorts[1]="";
      // }
      sorts[2]='agreementPrice≈desc';
    }
    else if(trianglebottom.hasClass('active')) {    // 从低到高
      trianglebottom.removeClass('active');
      triangleup.addClass('active');
     
      // if(sorts[0] = undefined){
      //   sorts[0]="";
      // }
      // if(sorts[1] = undefined){
      //   sorts[1]="";
      // }
      sorts[2]="agreementPrice≈asc";
    }
    else {                             // 第一次点击，默认从低到高
      triangleup.addClass('active');
      trianglebottom.removeClass('active');
      triangleup.addClass('active');
      
      // if(sorts[0] = undefined){
      //   sorts[0]="";
      // }
      // if(sorts[1] = undefined){
      //   sorts[1]="";
      // }
      sorts[2]='agreementPrice≈asc';     
    }
    // 移除其他按钮的样式
    this.removeSortActive( $target.siblings('.js-item-brands') );
  }

  // 按照 品牌，协议价 排序选择一种
  goodsSort(evt) {
    let self = this;
    let $target = $(evt.currentTarget);
    if($target.hasClass('js-item-brands')){ 
      let $targetCopy = $('.fix-nav-bar .js-item-brands');
      this.itemBrandsCssSync($targetCopy, this.newJsonSearch.sorts);
      this.itemBrandsCssSync($target, this.newJsonSearch.sorts);
    }
    if($target.hasClass('js-item-agreementPrice')){
      let $targetCopy = $('.fix-nav-bar .js-item-agreementPrice');
      this.itemAgreementPriceCssSync($targetCopy, this.newJsonSearch.sorts);
      this.itemAgreementPriceCssSync($target, this.newJsonSearch.sorts);
    }
    this.getSearchData(this.newJsonSearch, "filter");
  };

  FilterTradeType(evt){
    let trade = $(evt.target).val();
    this.newJsonSearch.offset = 1;
    this.newJsonSearch.tradeType = trade;
    this.getSearchData(this.newJsonSearch, "filter");
  }

  // 清空价格区间筛选
  cancelPriceFilter(evt){
    evt.stopPropagation();
    $('.js-price-range input').each(function(){
      $(this).val('');
    });
    this.newJsonSearch.offset = 1;
    this.newJsonSearch.low_price = "";
    this.newJsonSearch.high_price = "";
    this.getSearchData(this.newJsonSearch, "filter");
  }

  // 价格区间筛选
  priceRangeFilter(evt) {
    evt.stopPropagation();
    let self = this;
    let p_f, p_t;
    evt.preventDefault();

    p_f = $(this.filterForm).find('input[name=p_f]').val();
    p_t = $(this.filterForm).find('input[name=p_t]').val();

    // 同步到fix-nav-bar上
    $('.fix-nav-bar input.p_f').val( $('.goods-search-list input.p_f').val().trim() );
    $('.fix-nav-bar input.p_t').val( $('.goods-search-list input.p_t').val().trim() );

    if( p_f!="" || p_t!=""){
      if( p_f!="" && p_t!=""){
        if(parseInt(p_f) > parseInt(p_t)) {
          new Modal({
            icon: "info",
            title:"温馨提示",
            content: "输入的价格区间有误！请重新输入"
          }).show();
          return;
        }
      } 
      this.newJsonSearch.low_price = parseInt(p_f);
      this.newJsonSearch.high_price = parseInt(p_t);
      this.getSearchData(this.newJsonSearch, "filter");
    }
    else {
      new Modal({
        icon: "info",
        title:"温馨提示",
        content: "请输入价格区间进行筛选！",
      }).show();
    }
  };

  //  面包屑 按照品牌搜索
  brandSelectorClick(evt) {
    let self = this;
    let bid,newSearch = "" ;
    let target = $(evt.currentTarget);
    bid = target.data("id");
    this.newJsonSearch.brandIds=[];//清空品牌
    this.newJsonSearch.brandIds.push(bid);//添加商品id
    this.newJsonSearch.offset = 1;
    this.getSearchData(this.newJsonSearch, "category");
  };

  hideAttrSelector(evt) {
    evt.preventDefault();
    let target = $(evt.currentTarget);
    $('.other-options').find('.icon-xiangshangzhedie').removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
    $('.attr').removeClass('clicked');
    $('.otherAttrSearch').addClass('hide');
  }


  // 面包屑 公用 取消 筛选
  breadSelectorClick(evt, typeName, idName) {
    let self = this;
    let currentParams = [], newParams = [], newSearch = "";
    let target = $(evt.currentTarget);

    if(typeName="bids"){
      this.newJsonSearch.brandIds.splice($.inArray(target.data(idName),this.newJsonSearch.brandIds),1);
    }
    this.newJsonSearch.offset = 1;
    this.getSearchData(this.newJsonSearch, "category");
  }

  // 面包屑品牌筛选
  breadBrandSelectorClick(evt) {
    this.breadSelectorClick(evt, "bids", "id");
  };

  //? 面包屑后台 商品类目筛选
  breadCategorySelectorClick(evt) {
    let self = this;
    let cid;
    let target = $(evt.currentTarget);
    cid = target.data("id");
    this.newJsonSearch.brandIds=[];
    this.newJsonSearch.fcids=[];
    this.newJsonSearch.fcids.push(cid);
    this.getSearchData(this.newJsonSearch, "category");
  };

  // 搜索结果打印
  printSearchResult(evt) {
    return window.open("/api/zcy/reports/search" + this.search);
  };

  // 显示/收起 筛选菜单栏
  filterToggle(evt) {
    let $target = $(evt.currentTarget);
    let $categoryNav = $('.category-nav');
    if($target.prop("tagName").toLowerCase() != "i"){
      $target = $target.find('i');
    }

    if($target.hasClass('icon-xiangxiazhedie')){   // 展开
      if($categoryNav.hasClass('hide')){
        $categoryNav.removeClass('hide');
      }
      $target.siblings('span').text('收起筛选');
      $target.removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie');
    }
    else {    // 收起
      if(!$categoryNav.hasClass('hide')){
        $categoryNav.addClass('hide');
      }
      $target.siblings('span').text('显示筛选');
      $target.removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
    }
  }

  // 品牌多选确认
  brandConfirm(evt) {
    let self = this;
    let bids, brands, thisDl;
    let target = $(evt.currentTarget);
    thisDl = target.closest("dl");
    brands = [];
    $.each($(".brand-dd", thisDl), function(i, dd) {
      if ($(dd).find("input:checked").length > 0) {
        return brands.push($(dd).find("input:checked").val());
      }
    });
    if (brands.length === 0) {

    } else {
      this.newJsonSearch.brandIds = brands;
      this.newJsonSearch.offset = 1;
      this.getSearchData(this.newJsonSearch, "category");
    }
  };

  // 品牌 多选
  electsBrands(evt) {
    let $self, thisDl;
    $self = $(evt.currentTarget);
    $self.addClass("hide");
    thisDl = $self.closest("dl");
    $.each($("dd", thisDl), function(i, dd) {
      $(dd).find(".selector").addClass("hide");
      $(dd).find("label").removeClass("hide");
    });
    thisDl.find(".brand-buttons").removeClass("hide");
    thisDl.find('.js-brand-confirm').prop('disabled',true);
    $self.parent('.otherAttrSearch').find('.js-attrs-confirm').prop('disabled',true);
    let listmoreHeight = thisDl.find(".list-more").css("height", "100%").height();
    thisDl.find(".title").css("height", (listmoreHeight+57)+"px");
    thisDl.find(".js-more").text("收起");
    thisDl.find(".js-more").siblings("i").removeClass("icon-xiangxiazhedie").addClass("icon-xiangshangzhedie");
  };

  // 品牌多选取消
  brandCancel(evt) {
    let thisDl;
    thisDl = $(evt.currentTarget).closest("dl");
    thisDl.find(".more-options").removeClass("hide");
    this.cancel(thisDl);
    thisDl.find(".js-more").trigger("click");
  };

  // 多选取消公用方法
  cancel(thisDl) {
    // initial在ie中不支持
    // thisDl.find('dt').css("height", "initial");
    thisDl.find('dt').css("height", "45px");
    $.each($(".dd-cancel", thisDl), function(i, dd) {
      $(dd).find("input").prop("checked", false);
      $(dd).find(".selector").removeClass("hide");
      $(dd).find("label").addClass("hide");
    });
    return thisDl.find(".brand-buttons").addClass("hide");
  };
  

  // 更多 品牌选项 公用方法 提交事件
  categoriesMore(evt) {
    let currentTarget = $(evt.currentTarget),
        parentdl = currentTarget.closest("dl");
    if (currentTarget.find('a').text() == "收起") {
      if(parentdl.find('.brand-buttons').length > 0){
	      parentdl.find(".more-options").removeClass("hide");
	      this.cancel(parentdl);
      }
      parentdl.find(".list-more").css("height", "28px");
      parentdl.find("dt").css("height", "41px");
      currentTarget.find('a').text("更多");
      currentTarget.find(".icon-zcy").removeClass("icon-xiangshangzhedie").addClass("icon-xiangxiazhedie");
      return;
    } else {
      let listmoreHeight = parentdl.find(".list-more").css("height", "100%").height();
      parentdl.find("dt").css("height", (listmoreHeight+12)+"px");
      currentTarget.find('a').text("收起");
      currentTarget.find(".icon-zcy").removeClass("icon-xiangxiazhedie").addClass("icon-xiangshangzhedie");
      return;
    }
  };

  // 商品对比选择商品
  itemSelectId(evt) {
    let target = $(evt.currentTarget);
    let itemId = target.data("itemid");
    let flag = false;
    if(target.get(0).tagName == "SPAN" && !target.hasClass("cancleCompare")) {
      flag = true
    }
    if(target.get(0).tagName == "INPUT" && target.prop('checked')) {
      flag = true;
    }
    if (flag) {    // 对比
        $(".compare-checkbox[value='" + itemId + "']").prop('checked', true).parents("tr").addClass("checked-style");   // 保留列表tr被选中状态
        $("#"+itemId).addClass('cancleCompare').find('.content').text('取消对比');
        this.setItemCompareId(evt, itemId);
    } else {        // 取消对比
        $(".compare-checkbox[value='" + itemId + "']").prop('checked', false).parents("tr").removeClass("checked-style");
        $("#"+itemId).removeClass('cancleCompare').find('.content').text('对比');
        this.cancelItemCompareId(itemId);
    }
  }

  // 取消商品对比的item
  cancelItemCompareId(itemId) {
    return $.ajax({
      url: "/api/zcy/items/compare/cancelItemCompareId",
      type: "POST",
      data: {
        itemId: itemId
      },
      success: (function(_this) {
        return function(data) {
          //$(".compare-checkbox").prop("checked", false);
          return $.get("/api/zcy/items/compare/getItemCompareIds", function(el) {
            _this.compareCommon(el);
            return $.each(el, function(i, d) {
              return $(".compare-checkbox[value='" + d + "']").prop("checked", true);
            });
          });
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return new Modal({
            title: '温馨提示',
            icon: 'info',
            content: data.responseText
          }).show(function() {
                return $(evt.currentTarget).prop("checked", false);
              });
        };
      })(this)
    });
  };

  // hover删除对比商品
  deletelItemCompareId(evt) {
    let itemId;
    itemId = $(evt.currentTarget).closest(".product-contrast-li").data("id");
    $('#'+itemId).removeClass('cancleCompare').find('.content').text('对比');
    $(".compare-checkbox[value='" + itemId + "']").prop("checked", false);
    $(".compare-checkbox[value='" + itemId + "']").closest('tr').removeClass('checked-style');
    return this.cancelItemCompareId(itemId);
  };

  // 商品对比按钮
  btnCompare() {
    let itemIds;
    itemIds = _.map($(".js-select-product:not(.hide) .js-select"), (function(_this) {
      return function(i) {
        return $(i).data("id");
      };
    })(this));
    return location.href = "/buyer/compare-item?itemIds=[" + itemIds + "]";
  };
  // 关闭商品对比栏
  compareClose() {
    return $(".js-select-product").addClass("hide");
  };

  // 清空待对比的商品
  productEmpty() {
    return $.ajax({
      url: "/api/zcy/items/compare/discardAllCompareItem",
      type: "GET",
      success: function(data) {
        GoodsList.prototype.asncGet();
        $(".compare-checkbox").closest('tr').removeClass('checked-style');
        return $(".compare-checkbox").prop("checked", false);
      },
      error: function(data) {
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: data.responseText
        }).show();
      }
    });
  };
}

module.exports = GoodsList;


