const Modal = require('pokeball/components/modal');

const model = require('zcyEvE/page/shoppingcart/model');
const Server = require('zcyEvE/page/shoppingcart/server');
const baseComponent = require('common/base-component/index');

const deleteTemplate = Handlebars.templates['zcyEvE/page/shoppingcart/templates/delete'];
const infoTemplate = Handlebars.templates['zcyEvE/page/shoppingcart/templates/info'];
const cartListTemplate = Handlebars.templates['zcyEvE/page/shoppingcart/templates/cartList'];
const ruleTemplate = Handlebars.templates['zcyEvE/page/shoppingcart/templates/rule'];

class MedicalShoppingCart extends baseComponent {
  constructor () {
    super({
      events: {
        'change input.count-number': 'changeCount',
        'change input[name=item-checkbox]': 'itemCheck',
        'change input[name=shop-checkbox]': 'shopCheck',
        'change input[name=batchSelect]': 'batchSelect',
        'click #shoppingCart': 'shoppingCartSubmit',
        'click [name=deleteBtn]': 'deleCart'
      },
      $el: $('.medical-shoppingcart'),
      $table:$('.shoppingcart-table')
    });
  }

  initialize () {
    //this.beforeRander();
    this.$el = $('.medical-shoppingcart');
    this.$table = $('.shoppingcart-table');
    $.when(Server.getCartList({}),Server.getRule({})).then((d,d1)=>{
      if(d[0].items.length==0){
        return false;
      }
      this.rule = d1[0];
      this.renderRule();
      return this.changeData(d[0]);
    }).then((result)=>{
      if(!result ){
        $('.js-search-list').hide();
        $('.shoppingCart-withItem').hide();
        $('.shoppingCart-none').show();
      }else{
        $('.js-search-list').hide();
        $('.shoppingCart-withItem').show();
        $('.shoppingCart-none').hide();
        this.$el.find('.shoppingcart-table tbody').html(cartListTemplate(result));
        this.beforeRander();
      }
    });


  }
  renderRule(){
    this.ruleMap = {
      min        : this.rule.result.asPackConfigMap["30"].minBrand,
      max        : this.rule.result.asPackConfigMap["30"].maxBrand,
      percent    : this.rule.result.asPackConfigMap["30"].maxPercentDiffPrice,
      isAllOpen  : this.rule.result.ruleInfoMap.YZG0201.parameterValue==1,  //竞价采购 - 开启
      oneOpen    : this.rule.result.ruleInfoMap.YZG0203.parameterValue==1,    //单品牌竞价 开启
      mulOpen    : this.rule.result.ruleInfoMap.YZG0204.parameterValue==1,     //多品牌竞价 开启
      money    : this.rule.result.ruleInfoMap.YZG0101.parameterValue
    };
    this.$el.find('.rule-text').html(ruleTemplate(this.ruleMap));

  }
  deleCart(e){
    this.$tr = $(e.target).closest('tr');
    this.modal = new Modal(deleteTemplate());
    this.modal.show();
  }
  changeData(d){
    let result = d;
    let idx = 0;
    let obj ={};

    $.each(result.items,function(i,v){
      let supplierName = this.good.supplierName;
      let data = this;
      if(!obj[supplierName]){
        obj[supplierName] = {
          shopId:++idx,
          data:[]
        };
      }
      let amount = data.amount || 0;
      let price = Number(data.good.agreementPrice);
      data.good.allprice = (price * amount).toFixed(2);
      data.good.agreementPrice = price.toFixed(2);
      obj[supplierName].data.push(data);

    });
    return obj;
  }
  beforeRander(){
    $('.input-amount').amount();
    //this.checkSubmit();
    let that = this;
    $('body').on('click','.shopcart-dialog .delete-close',()=>{
      this.modal.close();
    });
    $('body').on('click','.shopcart-dialog .delete-submit',()=>{
      let itemId = this.$tr.data('itemid');
      let shopid = this.$tr.data('shopid');
      Server.deleteItem([itemId]).then((res) => {
        this.$tr.remove();
        let $itemTr = that.$el.find('.shoppingcart-table .shoppingcart-goods-tr2');
        let $itemTr1 = that.$el.find('.shoppingcart-table .shoppingcart-goods-tr1');
        if($itemTr.filter(`[data-shopid=${shopid}]`).length==0){
          $itemTr1.filter(`[data-shop=${shopid}]`).remove();
        }
        if ($('[name=item-checkbox]').length == 0) {
          $('.shoppingCart-withItem').hide();
          $('.shoppingCart-none').show();
        }
        $('.zcy-header').find('.cart').trigger('updateCount');
        this.checkSubmit();
      });
      this.modal.close();
    });

  }
  setValue(evt){
    let $tar = $(evt.target);
    //let $input = $(evt.target).siblings('input.count-number');
    let prevValue = $tar.data('amount');
    let amount = Number($tar.val());
    if (amount == '' || amount <= 0 || isNaN($tar.val())) {
      $tar.val(prevValue);
      return;
    }
    let id = $tar.closest('tr').data('itemid');
    let params = {
      good:{id},
      amount
    };
    Server.changeAmout(params).then((d)=>{
      $tar.data('amount',$tar.val())
    }).fail(()=>{
      $tar.val(prevValue);
    }).always(()=>{
      this.sumItem($(evt.target).closest('.shoppingcart-goods-tr2'));
    });
  }
  // 点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusCount (evt) {
    //$(evt.target).siblings('input.count-number').change();
  }

  // 计算每个商品的价格
  sumItem (item) {
    let unitPrice = $(item).find('.price').text();
    let count = parseInt($(item).find('.count-number').val(), 10);
    $(item).find('.count-number').val(count);
    $(item).find('.item-subtotal').text((unitPrice * count).toFixed(2));
  }

  // 手动更改商品数量（input控件修改）
  changeCount (evt) {
    let input = $(evt.target);
    let count = input.val();
    if (count == '' || count <= 0) {
      input.val(1);
      input.trigger('blur');
    }
    this.setValue(evt);
    // 当前商品 总价
  }

  // 校验是否可以生成竞价单
  checkSubmit () {
    let $check = $('[name=item-checkbox]:checked');
    let $cart = $('#shoppingCart');
    let $ruleBox = this.$el.find('.ruleError');
    if(!$ruleBox.length){
      return;
    }
    $cart.prop('disabled', true);
    $ruleBox.empty();
    $('input[name=batchSelect]').prop('checked', false);
    if ($check.length == $('[name=item-checkbox]').length) {
      $('[name=batchSelect]').prop('checked', true);
    }
    let checks = this.$el.find('.shoppingcart-goods-tr2')
                      .find('[name=item-checkbox]:checked');
    //
    if(!this.ruleMap.isAllOpen){
      $ruleBox.html('竞价采购交易方式已关闭');
      return false;
    }
    let min = false;
    let max = false;
    this.brand = [];
    let that = this;
    let percent = Number(this.ruleMap.percent);
    $.each(checks,function(){
      let price = Number($(this).data('price'));
      //let shopId =$(this).data('shopid');
      let itemId = $(this).data('itemid');
      if(!min){
        min = price;
        max = price;
      }else{
        if(price < min){
          min = price;
        }else if(price > max){
          max = price;
        }
      }
      //$.inArray(shopId,that.brand) < 0 && that.brand.push(shopId);
      $.inArray(itemId,that.brand) < 0 && that.brand.push(itemId);
    });
    if(checks.length==0){
      $ruleBox.html('');
      return false;
    }
    if(that.brand.length == 1){
      if(!this.ruleMap.oneOpen){
        $ruleBox.html('目前不允许发起单品牌竞价');
        return false;
      }
    }else{
      if(!this.ruleMap.mulOpen){
        $ruleBox.html('目前不允许发起多品牌竞价');
        return false;
      }
      if(that.brand.length<this.ruleMap.min || that.brand.length>this.ruleMap.max){
        $ruleBox.html(`品牌数量最少${this.ruleMap.min}个，最多不超过${this.ruleMap.max}`);
        return false;
      }
       if(min*(1+(percent/100)) < max){
         $ruleBox.html(`品牌商品之间差值不超过${percent}%比例`);
         return false;
       }
    }
    $cart.prop('disabled', false);
    //$check.length != 0 && $cart.prop('disabled', false);


    // 后续补充判断竞价方式的逻辑
    // 竞价采购-多品竞价配置关闭后，勾选多个商品时，『生成竞价单』按钮置灰禁用
    // 竞价采购-单品竞价配置关闭后，勾选单个商品时，『生成竞价单』按钮置灰禁用
    // 竞价采购交易方式配置关闭后，无论勾选与否，『生成竞价单』按钮置灰禁用
  }

  // 单商品选择
  itemCheck (evt) {
    let shopId = $(evt.target).closest('tr').data('shopid');
    if ($(evt.target).is(':checked')) {
      $(evt.target).closest('tr').addClass('checked');
    } else {
      $(evt.target).closest('tr').removeClass('checked');
    }
    $('tr[data-shop=' + shopId + '] input[type=checkbox]').prop('checked', false);
    if ($('tr[data-shopid=' + shopId + '] input[type=checkbox]:checked').length == $('tr[data-shopid=' + shopId + '] input[type=checkbox]').length) {
      $('tr[data-shop=' + shopId + '] input[type=checkbox]').prop('checked', true);
    }
    this.checkSubmit();
  }

  // 选择店铺商品
  shopCheck (evt) {
    let status = $(evt.target).is(':checked');
    let shopId = $(evt.target).closest('tr').data('shop');
    $('tr[data-shopid=' + shopId + '] input[type=checkbox]').prop('checked', status);
    if (status) {
      $('tr[data-shopid=' + shopId + ']').addClass('checked');
    } else {
      $('tr[data-shopid=' + shopId + ']').removeClass('checked');
    }
    this.checkSubmit();
  }

  // 全选商品
  batchSelect (evt) {
    let status = $(evt.target).is(':checked');
    $('.shoppingcart-table input[type=checkbox]').prop('checked', status);
    if (status) {
      $('.shoppingcart-goods-tr2').addClass('checked');
    } else {
      $('.shoppingcart-goods-tr2').removeClass('checked');
    }
    this.checkSubmit();
  }

  // 提交购物车
  shoppingCartSubmit () {
    let $check = this.$el.find('[name=item-checkbox]:checked');
    // 校验生成竞价单
    // new Modal(infoTemplate()).show();
    const obj = [];
    if ($check.length == 0) {
      new Modal({
        icon: 'error',
        title: '请先选择商品！'
      }).show();
      return false;
    }
    let param = {
      "requireItemEditParamList":[],
      "tradeType":2,
      "requireType":this.brand.length > 1 ? 30 : 20
    };
    $check.each((i, n) => {
      let item = {};
      item.protocolId = $(n).closest('tr').data('itemid');
      item.shopType = 10;
      item.quantity = $(n).closest('tr').find('.count-number').val();
      item.protocolPrice = $(n).closest('tr').find('.price').data('price');
      param.requireItemEditParamList.push(item);
    });

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

}

module.exports = MedicalShoppingCart;
