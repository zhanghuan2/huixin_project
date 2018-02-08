import Modal from "pokeball/components/modal";

function getStaticBody(content, icon) {
  return `
    <div class="zcy-modal-static-content">
      <div class="col-3 text-right zcy-modal-icon">
        <i class="icon-zcy ${icon == "" ? "icon-notify-info" : icon} mr-lg"></i>
      </div>
      <div class="col-8 zcy-modal-static-desc">${content}</div>
      <div class="clearfix"></div>
    </div>`;
}

function getTextareaBody(options) {
  return `
    <div class="zcy-modal-textarea-content">
      <textarea name="${options.name}" id="${options.name}" rows="10" placeholder="${options.placeholder}"></textarea>
    </div>
  `;
}

function getConfirmDom(options) {
  return `
    <div style="width:500px;" class="modal zcy-modal ${options.customClass}" data-event="comfirm-modal">
      <div class="modal-header">
        <a href="#" class="close">&times;</a>
        <span>${options.title}</span>
      </div>
      <div class="modal-body">${options.type == "static" ? getStaticBody(options.content, options.icon) : getTextareaBody(options)}</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-info close">${options.noBtn}</button>
        <button type="button" class="btn btn-primary submit">${options.yesBtn}</button>
      </div>
    </div>`;
}

function showConfirm(opts) {
  const defaults = {
    title: "请确认",
    content: "",
    yesBtn: "确定",
    noBtn: "取消",
    onSubmit: $.noop,
    onCancel: null,
    onClose: $.noop,
    icon: ""
  };
  const options = $.extend(defaults, opts);
  const dom = getConfirmDom(options);
  new Modal(dom).show(options.onSubmit, {
    beforeClose: options.onCancel || options.onClose
  });
}

export default {
  staticModal: (opts) => {
    const options = $.extend({
      type: "static"
    }, opts);
    showConfirm(options);
  },

  textareaModal: (opts) => {
    const options = $.extend({
      type: "textarea",
      placeholder: "请输入"
    }, opts, {
      onSubmit: ($modal) => {
        const text = $(`.zcy-modal #${opts.name}`).val();
        opts.onSubmit && opts.onSubmit($modal, text);
      }
    });
    showConfirm(options);
  }
};
