const baseComponent = require('common/base-component/index');
const ShoppingCart = require('zcyEvE/comp/header/shopping-cart');
const Query = require('common/query/extend');


class PageHeader extends baseComponent {
  constructor () {
    super({
      events: {
        'click .search-btn': 'search',
        'mouseenter .category-item': 'showSubCategory',
        'mouseleave .category-item': 'hideSubCategory',
        'mouseenter .category-trigger': 'showCategory',
        'mouseleave .category-trigger': 'hideCategory',
        'mouseenter .category': 'showCategory',
        'mouseleave .category': 'hideCategory',
        'keyup .J_search-input': 'searchByEnter'
      },
      $el: $('.zcy-header')
    });
  }

  /**
   * 初始化
   */
  initialize () {
    this.categoryVisible = this.$el.find('.J_categoryVisible').html() === 'true';
    this.shoppingCart = new ShoppingCart();
    this.shoppingCart.initialize();
    this.query = new Query();

    $('.zcy-header').find('.cart').on('updateCount',()=>{
      this.shoppingCart.update();
    })
  }

  initSearch () {
    const searchText = this.query.get('q');
    if (searchText) {
      this.$el.find('.J_search-input').val(searchText);
    }
  }

  /**
   * 显示一级菜单
   */
  showCategory () {
    if (this.categoryVisible) { return false; }
    this.$el.find('.category').removeClass('hide');
  }

  /**
   * 隐藏一级菜单
   */
  hideCategory () {
    if (this.categoryVisible) { return false; }
    this.$el.find('.category').addClass('hide');
  }

  /**
   * 显示二级分类
   */
  showSubCategory (event) {
    const $categoryItem = $(event.currentTarget);
    this.hideSubCategory();
    $categoryItem.find('.sub-category').show();
    $categoryItem.addClass('selected');
  }

  /**
   * 隐藏二级分类
   */
  hideSubCategory () {
    this.$el.find('.sub-category').hide();
    this.$el.find('.category-item').removeClass('selected');
  }

  /**
   * enter搜索
   */
  searchByEnter (e) {
    if (e.keyCode === 13) {
      this.search();
    }
  }

  /**
   * 搜索
   */
  search () {
    const $input = this.$el.find('.J_search-input');
    const value = $.trim($input.val());
    window.location.href = `/medical/search?q=${encodeURIComponent(value)}`;
  }
}

module.exports = PageHeader;
