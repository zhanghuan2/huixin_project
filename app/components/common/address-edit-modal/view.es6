const Address = require("common/address/view");
const Checker = require('common/formchecker/extend');
const Modal = require('pokeball/components/modal');
const editModal = Handlebars.templates["common/address-edit-modal/templates/view"];

let checkModal = (modal) => {
    let precheck = null;
    switch (modal.options.type) {
        case 'add':
            precheck = false;
            break;
        case 'modify':
            precheck = true;
            break;
    }
    Checker.formChecker({
        container: modal.html,
        ctrlTarget: modal.html.find('#save-edit-address'),
        precheck: precheck
    });
};

let checkMobieAndPhone = (modal) => {
    let result = null;
    let mobile = modal.html.find(`input[name = 'mobile']`).val();
    let phone = modal.html.find(`input[name = 'phone']`).val();
    if (mobile === '' && phone === '') {
        result = false;
        new Modal ({
            icon: 'error',
            isConfirm: false,
            title: '输入数据有误',
            content: '手机号码与固定电话必须输入其中一项。'
        }).show();
    }
    else {
        result = true;
    }
    return result;
};

let createModal = (modal) => {
    let data = {
        type: modal.options.type,
        data: null
    };
    switch (modal.options.type) {
        case 'add':
            data.data = {};
            break;
        case 'modify':
            data.data = modal.options.data;
            break;
    }
    modal.html = $(editModal(data));
    $('body').append(modal.html);
    new Address();
    modal.html.find('select').selectric();
    modal.html.find('#save-edit-address').on('click', () => {
        if (checkMobieAndPhone(modal)) {
            submitForm(modal);
        }
    });
    modal.html.find('.close').on('click', () => {
        closeForm(modal);
    });
    checkModal(modal);
    modal.modal = new Modal(modal.html);
    modal.modal.show(() => {});
    modal.html.find(`input[name = 'receiverName']`).focus();
};

let submitForm = (modal) => {
    let form = modal.html;
    let data = {
        receiverName: form.find(`input[name = 'receiverName']`).val(),
        province: form.find(`select[name = 'province']`).find("option:selected").text(),
        provinceCode: form.find(`select[name = 'province']`).val(),
        city: form.find(`select[name = 'city']`).find("option:selected").text(),
        cityCode: form.find(`select[name = 'city']`).val(),
        region: form.find(`select[name = 'region']`).find("option:selected").text(),
        regionCode: form.find(`select[name = 'region']`).val(),
        street: form.find(`select[name = 'street']`).val() && form.find(`select[name = 'street']`).find("option:selected").text(),
        streetCode: form.find(`select[name = 'street']`).val(),
        details: form.find(`textarea[name = 'details']`).val(),
        zip: form.find(`input[name = 'zip']`).val(),
        mobile: form.find(`input[name = 'mobile']`).val(),
        areaCode: form.find(`input[name = 'areaCode']`).val(),
        phone: form.find(`input[name = 'phone']`).val(),
        phoneExt: form.find(`input[name = 'phoneExt']`).val(),
        isDefault: form.find(`input[name = 'isDefault']`).prop("checked")
    };
    if (!data.street) {
        data.street = '';
    }
    if (!data.streetCode) {
        data.streetCode = '';
    }
    let ajaxOptionsVariable = {
        method: '',
        typeText: '',
        addressId: ''
    };
    switch (modal.options.type) {
        case 'add':
            ajaxOptionsVariable.method = 'post';
            ajaxOptionsVariable.typeText = '新增';
            break;
        case 'modify':
            ajaxOptionsVariable.method = 'put';
            ajaxOptionsVariable.typeText = '修改';
            ajaxOptionsVariable.addressId = `/${modal.options.data.id}`;
            break;
    }
    let ajaxOptions = {
        type: ajaxOptionsVariable.method,
        url: `/api/user/receivers${ajaxOptionsVariable.addressId}`,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (data) => {
            if (!data.success) {
                ajaxOptions.error();
            }
            else {
                new Modal ({
                    icon: 'success',
                    title: `${ajaxOptionsVariable.typeText}收货地址成功`
                }).show(() => {
                    modal.modal.close();
                    if (typeof modal.options.success === 'function') {
                        modal.options.success(data.result);
                    }
                });
            }
        },
        error: () => {
            new Modal ({
                icon: 'error',
                isConfirm: false,
                title: `${ajaxOptionsVariable.typeText}收货地址失败`,
                content: '请重新填写信息'
            }).show();
        }
    };
    $.ajax(ajaxOptions);
};

let closeForm = (modal) => {
    modal.modal.close();
    if (typeof modal.options.close === 'function') {
        modal.options.close();
    }
};

class AddressEditModal {
    constructor(options) {
        this.html = null;
        this.options = options;
        createModal(this);
    }
}

module.exports = AddressEditModal;