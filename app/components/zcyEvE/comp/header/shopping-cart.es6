class ShoppingCart {
  initialize () {
    this.$shoppingCartAmount = $('.J_shopping-cart-amount');
    this.update();
  }

  update (num) {
    if (!this.$shoppingCartAmount.length) {
      return;
    }
    if (typeof num === 'number' && num >= 0) {
      this.setAmount(num);
      return;
    }
    $.get('/medical/cart/list', (data) => {
      const amount = data.totalAmount || 0;
      this.setAmount(amount);
    }, 'json');
  }

  setAmount (amount) {
    this.$shoppingCartAmount.text(amount);
  }
}

module.exports = ShoppingCart;
