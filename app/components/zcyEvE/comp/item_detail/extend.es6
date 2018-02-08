const OriginItemDetail = require('zcyEvE/comp/detail_base/view');

const Modal = require('pokeball/components/modal');
const Cookie = require('common/cookie/view');
const Server = require('zcyEvE/page/shoppingcart/server');



const addToCartTemplate = Handlebars.templates['zcyEvE/comp/item_detail/templates/cart_tip'];
// const activityTemplate = Handlebars.templates['zcyEvE/comp/detail_base/templates/activity'];

const taxDistrictCodeArr = ['001000', '981000', '991000'];

class ItemDetail extends OriginItemDetail {
  constructor ($) {
    let goodsId = jQuery.query.get('goodsId'),
      itemId = jQuery.query.get('itemId'),
      supplierCode = jQuery.query.get('supplierCode');

    if (goodsId && itemId && supplierCode) {
      Cookie.addCookie('goodsId', goodsId, 0, window.location.hostname);
      Cookie.addCookie('itemId', itemId, 0, window.location.hostname);
      Cookie.addCookie('supplierCode', supplierCode, 0, window.location.hostname);
    } else {
      let goodsId = Cookie.getCookie('goodsId'),
        itemId = Cookie.getCookie('itemId'),
        supplierCode = Cookie.getCookie('supplierCode');
      window.location.href = '/medical/detail?goodsId=' + goodsId + '&itemId=' + itemId + '&supplierCode=' + supplierCode;
    }
    super($);
    this.result = {};
    this.total = 0;
    this.flag = 1;
    this.itemId = $('#YZHD_ITEMID')
      .val();
    this.addressClose = $('.address-close');
    this.callback = null;
    this.renderRule();
  }
  /**
   * 校验是否有生成竞价单的权限。
   * */
  renderRule(){
    Server.getRule({}).then((d)=>{
      this.setBtnRule(d);
    })
  }
  setBtnRule(d){
    let isAllOpen = d.result.ruleInfoMap.YZG0201.parameterValue==1;
    let oneOpen = d.result.ruleInfoMap.YZG0203.parameterValue==1;
    let mulOpen = d.result.ruleInfoMap.YZG0204.parameterValue==1;
    let money = d.result.ruleInfoMap.YZG0101.parameterValue;
    let gtRule = d.result.ruleInfoMap.YZG0301.parameterValue==1;
    let $cart = $('.js-add-cart');
    let $btn = $('#choose-btns');
    if(!$btn.length){
      return;
    }
    let price = Number($btn.data('price'));
    let $groupPrice = $('#group-li');
    if (Number($groupPrice.data('price')) >= (Number(money) * 10000)) {
      gtRule ? $('.js-buy-now').prop('disabled', false) : $('.js-buy-now').prop('disabled', true);
    }else{
      if(isAllOpen && oneOpen){
        $('.js-buy-now').prop('disabled', false);
      }
    }
    if(!!$btn.length){
      if(price < (Number(money)*10000)){
        $cart.removeClass('hide');
        if(!isAllOpen){
          $cart.prop('disabled', true);
        }
      }
    }
  }
  bindEvent () {
    this.initAddress();
    this.comparePrice();
    this.itemPlatformPrice = $('#js-item-platform-price', this.$el);
    $(document)
      .on('click', this.showAddress, (evt) => this.popAddressSelect(evt));
    $(document)
      .on('click', '.js-find-stock li', (evt) => this.findStock(evt));
    //this.quantityByStockFunction(this.itemId, Cookie.getCookie('aid') || '330102');
    $('#item-quantity').on('input keyup', (evt) => {
      evt.stopPropagation();
      let target = $(evt.target);
      let test = (/^[1-9]\d*$/).test(target.val());
      if (!test) {
          target.val('');
      }
    });
    super.bindEvent();
  }

  // 把组合的key放入结果集@SKUResult
  add2SKUResult (combArrItem, sku) {
    let key = combArrItem.join(';');
    if (this.SKUResult[key]) { // SKU信息key属性
      this.SKUResult[key].stockQuantity += sku.stockQuantity;
      this.SKUResult[key].prices.push(sku.price);
      if (sku.extraPrice.platformPrice) {
        this.SKUResult[key].platformPrice.push([sku.extraPrice.platformPrice]);
      }
    } else {
      this.SKUResult[key] = $.extend({}, true, sku);
      this.SKUResult[key].prices = [sku.price];
      if (sku.extraPrice.platformPrice == 0 || sku.extraPrice.platformPrice) {
        this.SKUResult[key].platformPrice = [sku.extraPrice.platformPrice];
      }
    }
  }

  // 初始化得到结果集
  initOtherSku (data) {
    let i = this.getObjKeys(data),
      j = this.getObjKeys(data),
      skuKeys = this.getObjKeys(data);
    data = _.object(this.getObjKeys(data), data);
    this.SKUResult = {};
    _.each(skuKeys, (skuKey) => {
      let sku = data[skuKey],
        skuKeyAttrs = skuKey.split(';');
      this.attrLength = this.attrLength || skuKeyAttrs.length;

      // 对每个SKU信息key属性值进行拆分组合
      let combArr = this.arrayCombine(skuKeyAttrs);
      _.each(combArr, (arr) => {
        this.add2SKUResult(arr, sku);
      });

      // 结果集接放入this.SKUResult
      this.SKUResult[skuKey] = $.extend({}, true, sku);
      this.SKUResult[skuKey].prices = [sku.price];
      this.SKUResult[skuKey].image = sku.image;
      if (sku.extraPrice.platformPrice || sku.extraPrice.platformPrice == 0) {
        this.SKUResult[skuKey].platformPrice = [sku.extraPrice.platformPrice];
      }
    });
  }

  setSkuInfo (sku) {
    super.setSkuInfo(sku);
    if (sku.platformPrice) {
      let maxPlatformPrice = _.max(sku.platformPrice),
        minPlatformPrice = _.min(sku.platformPrice);
      this.itemPlatformPrice.text(maxPlatformPrice > minPlatformPrice ? priceFormat(minPlatformPrice) + '-' + priceFormat(maxPlatformPrice) : priceFormat(maxPlatformPrice));
    }
  }

  itemQuantityPresent () {
    // 检查商品数量
    let quantity = $('.count-number')
      .val();
    if (quantity < 1) {
      this.warning(0);
      return;
    }
    return quantity;
  }

  // 加入购物车，成功返回 200
  addCart () {
    if (true) {
      // 检查商品数量
      if (+$('#item-quantity')
          .val() < 1) {
        new Modal({
          title: '温馨提示',
          icon: 'info',
          content: '商品数量输入有误'
        }).show();
        return;
      }
      $('.js-add-cart').prop('disabled',true);
      let selectedSku = this.sku;
      let agreeMentId = $.query.get('goodsId');
      let params = {
        good:{
          id:agreeMentId
        },
        amount:$('.count-number').val()
      };
      return $.ajax({
        async: false,
        url: '/medical/cart/add',
        type: 'POST',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(params),
        success: (data) => {
          if (data) {
            new Modal(addToCartTemplate()).show();
            $('.zcy-header').find('.cart').trigger('updateCount');
          }
          $('.ceiling')
            .data('compInstance')
            .getCartCount();
        },
        complete:()=>{
          $('.js-add-cart').prop('disabled',false);
        }
      }).status;
    } else {
      /*this.warning(0)*/
    }
  }

  //立即购买
  buyNow (evt) {
    // 检查商品数量
    if (+$('#item-quantity')
        .val() < 1) {
      new Modal({
        title: '温馨提示',
        icon: 'info',
        content: '商品数量输入有误'
      }).show();
      return false;
    }
    let param = {
      "requireItemEditParamList":[],
      "tradeType":1,
      "requireType":20
    };
    let agreeMentId = $.query.get('goodsId');
    let item = {};
    let _price = Number($('#js-item-price').data('range'));
    if(_price<70000){
      param.tradeType = 2
    }else{
      param.tradeType = 1
    }
    item.protocolId = agreeMentId;
    item.shopType = 10;
    item.quantity = $('.count-number').val();
    item.protocolPrice = _price;
    param.requireItemEditParamList.push(item);

    Server.submitChangeApi(param).then((res) => {
      if(res.success){
        let link = $('.envHref').data('href');
        location.href = `${link}/agreementsupply/order/order?id=${res.result.id}`;
      }else{
        new Modal({
          title: '错误',
          icon: 'info',
          content: res.message
        }).show();
      }
    });
  }

  popAddressSelect (evt) {
    $('.address-area')
      .show();
    this.initAddress();
    $('.address-close')
      .click(() => {
        $('.address-area')
          .hide();
      });
  }

  initAddress () {
    $.ajax({
      url: '/api/address/0/children',
      type: 'GET',
      success: (data) => {
        $(`.address-tab li[data-level=1]`)
          .trigger('click');
        this.provinceChange();
      }
    });
  }

  comparePrice () {
    $('.compare-price li')
      .on('click', function () {
        window.open($(this)
          .data('id'));
      });
  }

  findStock (evt) {
    _.each($('.js-sku-attr'), (el) => {
      $(el)
        .removeClass('selected');
    });
    let leafRegion = $(evt.currentTarget)
      .data('value');
    Cookie.addCookie('aid', leafRegion, 30, window.location.hostname);
    //this.quantityByStockFunction(this.itemId, leafRegion);
  }

  // quantityByStockFunction (itemId, leafRegion) {
  //   this.initSkuSelect('false');
  //   $.ajax({
  //     url: '/api/zcy/stocks/findStockByItemIdAndRegion',
  //     type: 'GET',
  //     data: {
  //       itemId,
  //       leafRegion
  //     },
  //     success: (data) => {
  //       this.result = data;
  //       this.initAllStock(data);
  //       this.combineStock();
  //     },
  //     error: (data) => {
  //       this.initSkuSelect('disabled');
  //       $('#js-item-stock')
  //         .text(0);
  //     }
  //   });
  // }

  combineStock () {
    this.total = 0;
    this.skus = $('#choose')
      .data('skus');
    _.each(this.skus, (el) => {
      el.stockQuantity = this.result[el.id];
    });
    this.dealSkus();
    this.initOtherSku(this.skus);
    this.autoSelectSku();
  }

  initAllStock (data) {
    _.each(_.values(data), (el) => {
      this.total = el + this.total;
    });
    $('#js-item-stock')
      .text(this.total);
    $('#js-item-stock')
      .data('stock', '9999999999');
    if (this.total) {
      $('.js-item-stock-quantity')
        .data('max', '9999999999')
        .data('mix', 1);
      $('#item-quantity')
        .val(1);
    } else {
      $('.js-item-stock-quantity')
        .data('max', '9999999999')
        .data('min', 0);
      $('#item-quantity')
        .val(1);
    }
  }

  //复写按钮无效方法
  autoSelectSku () {
    _.each(this.$skuAttr, (i, d) => {
      let attr_id = $(i)
        .data('attr');
      if (!this.SKUResult[attr_id]) {
        $(i)
          .attr('disabled', 'disabled');
      } else {
        $(i)
          .attr('disabled', false);
      }
    });
  }

  //sku设置是否可选
  initSkuSelect (mode) {
    _.each($('.js-sku-attr'), (i, d) => {
      $(i)
        .attr('disabled', false);
    })
  }


}

module.exports = ItemDetail;
