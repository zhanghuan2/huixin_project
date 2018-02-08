const Modal = require('pokeball/components/modal');
const showComponent = Handlebars.templates['common/address-show/templates/view'];

let addressData = null;

let createComponent = (component) => {
    let componentData = {
        data: addressData
    };
    component.html = $(showComponent(componentData));
    $(component.options.container).append(component.html);
};

let getData = (component) => {
    let ajaxOptions = {
        type: 'get',
        url: component.options.url,
        contentType: "application/json",
        data: component.options.data,
        success: (data) => {
            if (!data.success) {
                ajaxOptions.error();
            }
            else {
                addressData = data.result;
                createComponent(component);
            }
        },
        error: () => {
            new Modal ({
                icon: 'error',
                isConfirm: false,
                title: '获取收货地址失败',
            }).show();
        }
    };
    $.ajax(ajaxOptions);
};

class AddressShow {
    constructor(options) {
        this.html = null;
        this.options = options;
        getData(this);
    }

    getAddressData(filter) {
        let data = null;
        switch (typeof filter) {
            case 'string':
                switch (filter) {
                    case 'select':
                        data = addressData.filter((item) => {
                            return item.isSelected === true;
                        });
                        break;
                    case 'unSelect':
                        data = addressData.filter((item) => {
                            return item.isSelected === false;
                        });
                        break;
                    case 'default':
                        addressData.some((item) => {
                            if (item.isDefault === true) {
                                data = item;
                            }
                            return item.isDefault === true;
                        });
                        break;
                    default:
                        console.log('未被定义的过滤条件！');
                }
                break;
            case 'number':
                addressData.some((item) => {
                    if (item.id === filter) {
                        data = item;
                    }
                    return item.id === filter;
                });
                break;
            case 'function':
                data = addressData.filter((item) => {
                    return filter(item);
                });
                break;
            default:
                console.log('过滤条件不符合要求！');
        }
        return data;
    }
}

module.exports = AddressShow;