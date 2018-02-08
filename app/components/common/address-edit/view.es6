const EditAddressModal = require('common/address-edit-modal/view');
const EditAddressList = require('common/address-edit-list/view');
const editComponent = Handlebars.templates['common/address-edit/templates/view'];
const addAddressButton = Handlebars.templates['common/address-edit/templates/add-address-button'];

let setAddAddressButton = (component) => {
    let button = component.addAddressButton.find('button');
    button.on('click', () => {
        let addressModalOptions = {
            type: 'add',
            success: (data) => {
                data.quantity = null;
                data.remark = null;
                data.isSelected = true;
                data.fullAddress = data.province + data.city + data.region + data.street + data.details;
                component.listHtml.addAddressItem(data, 'prev');
                if (component.listHtml.length >= component.options.maxLength) {
                    button.attr('disabled', 'disabled');
                }
            },
            close: () => {
                component.listHtml.checkPage();
            }
        };
        new EditAddressModal(addressModalOptions);
    });
    if (component.listHtml.length >= component.options.maxLength) {
        button.attr('disabled', 'disabled');
    }
};

let renderList = (component) => {
    let addressListOptions = {
        container: component.html,
        url: component.options.url,
        data: component.options.data,
        actions: [
            {
                type: 'modify',
                click: (data) => {
                    let addressModalOptions = {
                        type: 'modify',
                        data: data,
                        success: (data) => {
                            data.quantity = null;
                            data.remark = null;
                            data.isSelected = true;
                            data.fullAddress = data.province + data.city + data.region + data.street + data.details;
                            component.listHtml.modifyAddressItem(data);
                        },
                        close: () => {
                            component.listHtml.checkPage();
                        }
                    };
                    new EditAddressModal(addressModalOptions);
                }
            }
        ],
        placeholderAction: () => {
            let addressModalOptions = {
                type: 'add',
                success: (data) => {
                    data.quantity = null;
                    data.remark = null;
                    data.isSelected = true;
                    data.fullAddress = data.province + data.city + data.region + data.street + data.details;
                    component.listHtml.addAddressItem(data, 'prev');
                },
                close: () => {
                    component.listHtml.checkPage();
                }
            };
            new EditAddressModal(addressModalOptions);
        },
        firstRender: component.options.firstRender,
        callback: () => {
            component.addAddressButton = $(addAddressButton({}));
            component.html.prepend(component.addAddressButton);
            setAddAddressButton(component);
        },
        checker: component.options.checker
    };
    component.listHtml = new EditAddressList(addressListOptions);
};

let createComponent = (component) => {
    component.html = $(editComponent({}));
    $(component.options.container).append(component.html);
    renderList(component);
};

class AddressEdit {
    constructor(options) {
        this.html = null;
        this.listHtml = null;
        this.addAddressButton = null;
        this.options = options;
        createComponent(this);
    }

    getAddressData(filter) {
        return this.listHtml.getAddressData(filter);
    }
}

module.exports = AddressEdit;