const baseComponent = require('common/base-component/index');

class MedicalIndex extends baseComponent {
  constructor () {
    super({
      events: {
      },
      $el: $('.medical-index-page')
    });
  }

  initialize () {
    this.initCarousel();
  }

  /**
   * 初始化轮播图
   */
  initCarousel () {
    const $carousel = this.$el.find('.carousel');
    const colorsStr = $carousel.data('colors');
    const colors = colorsStr.split(',') || [];
    const $bannerWrapper = $carousel.closest('.banner-wrapper');
    $carousel.carousel({
      before: (activeIndex) => {
        let color;
        if ((activeIndex + 1) === colors.length) {
          color = colors[0];
        } else {
          color = colors[activeIndex + 1];
        }
        color && $bannerWrapper.css('background-color', color);
      }
    });
  }
}

module.exports = MedicalIndex;
