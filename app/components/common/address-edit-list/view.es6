const Modal = require('pokeball/components/modal');
const Checker = require('common/formchecker/extend');
const editList = Handlebars.templates["common/address-edit-list/templates/view"];
const editListItem = Handlebars.templates["common/address-edit-list/templates/item"];

let actions = {
    modify: {
        text: '修改地址',
        formName: 'modify-address'
    },
    remove: {
        text: '删除地址',
        formName: 'delete-address'
    }
};

let addressData = null;

let expandAllAddress = (list) => {
    let node = $(`<div class='expand-all'><a>显示全部地址</a></div>`);
    list.html.append(node);
    node.find('a').on('click', () => {
        list.html.find(`tbody[data-type = 'hideItems']`).slideDown();
        node.remove();
    });
};

let showPlaceholder = (list) => {
    let node = $(`<div class="address-list-placeholder">当前没有收货地址，请<a>新增地址</a></div>`);
    list.html.append(node);
    node.find('a').on('click', () => {
        if (typeof list.options.placeholderAction === 'function') {
            list.options.placeholderAction();
        }
        else {
            new Modal ({
                icon: 'error',
                isConfirm: false,
                title: '未添加任何行为'
            }).show();
        }
    });
    return node;
};

let setSelectAction = (itemData, itemHtml, list) => {
    let data = itemData.data;
    let quantityNode = $(`<div><input required checker-type='Number' type='text' name='quantity' placeholder='请输入' value='${data.quantity?data.quantity:""}'></div>`);
    let remarkNode = $(`<div><textarea max-length='500' placeholder='建议填写送货需求' value='${data.remark?data.remark:""}'>${data.remark?data.remark:""}</textarea></div>`);
    let actionNode = itemData.hasAction?$(list.actionHtml):null;
    let selectAddress = (isSelect) => {
        if (isSelect) {
            itemHtml.find(`td[data-type = 'quantity']`).prepend(quantityNode);
            quantityNode.off('change');
            quantityNode.on('input propertychange', (evt) => {
                evt.stopPropagation();
                let target = $(evt.target);
                let test = (/^[0-9]*[1-9][0-9]*$/).test(target.val());
                if (!test) {
                    target.val('');
                }
                data.quantity = target.val();
            });
            itemHtml.find(`td[data-type = 'remark']`).prepend(remarkNode);
            remarkNode.find('textarea').on('keyup', (evt) => {
                evt.stopPropagation();
                data.remark = $(evt.target).val();
            });
            if (actionNode) {
                itemHtml.find(`td[data-type = 'action']`).append(actionNode);
                itemHtml.find(`td[data-type = 'action'] a`).on('click', (event) => {
                    let actionType = $(event.target).data('type');
                    if (typeof actions[actionType].click === 'function') {
                        actions[actionType].click(data);
                    }
                });
            }
        }
        else {
            quantityNode.remove();
            remarkNode.remove();
            quantityNode.find('input').val('');
            remarkNode.find('textarea').val('');
            data.quantity = '';
            data.remark = '';
            if (actionNode) {
                actionNode.remove();
            }
        }
    };
    if (data.isSelected) {
        selectAddress(data.isSelected);
    }
    itemHtml.find(`input[name = 'selectAddress']`).on('change', (evt) => {
        evt.stopPropagation();
        data.isSelected = $(evt.target).prop("checked");
        selectAddress(data.isSelected);
        list.checkPage();
    });
};

let updateAddressData = (data, type) => {
    let setDefault = false;
    if (type === 'modify') {
        let itemIndex = null;
        addressData.some((item, index) => {
            if (item.id === data.id) {
                itemIndex = index;
                data.quantity = item.quantity;
                data.remark = item.remark;
                if (data.isDefault === true && item.isDefault === false) {
                    setDefault = true;
                }
            }
            return item.id === data.id;
        });
        addressData.splice(itemIndex, 1);
    }
    else if (type === 'add') {
        if (data.isDefault === true) {
            setDefault = true;
        }
    }
    //改变地址默认地址
    if (setDefault) {
        addressData.some((item) => {
            let returnData = false;
            if (item.isDefault === true) {
                item.isDefault = false;
                returnData = true;
            }
            return returnData;
        });
    }
    addressData.push(data);
};

let createList = (list) => {
    //所有地址的操作类型都统一，暂时不分别定制化
    let hasAction = list.options.actions && list.options.actions.length > 0;
    if (hasAction) {
        list.actionHtml = list.options.actions.reduce((html, action) => {
            actions[action.type].click = action.click;
            return html+`<a name='${actions[action.type].formName}' data-type='${action.type}'>${actions[action.type].text}</a>`;
        }, '');
    }
    let listData = {
        hasAction: hasAction
    };
    list.html = $(editList(listData));
    $(list.options.container).append(list.html);
    if (addressData.length > 0) {
        let selectAddressData = addressData.filter((item) => {
            return item.isSelected === true;
        });
        let unSelectAddressData = addressData.filter((item) => {
            return item.isSelected === false;
        });
        if (selectAddressData.length === 0 && list.options.firstRender === true) {
            let selectIndex = null;
            let hasDefault = unSelectAddressData.some((item, index) => {
                if (item.isDefault) {
                    selectIndex = index;
                }
                return item.isDefault;
            });
            if (!hasDefault) {
                selectIndex = 0;
            }
            let selectItem = unSelectAddressData.splice(selectIndex, 1)[0];
            selectItem.isSelected = true;
            selectAddressData.push(selectItem);
        }
        selectAddressData.forEach((item) => {
            list.addAddressItem(item);
        });
        unSelectAddressData.forEach((item, index) => {
            if (index < (3 - selectAddressData.length)) {
                list.addAddressItem(item);
            }
            else {
                list.addAddressItem(item, 'after', false);
            }
        });
        if (addressData.length > 3 && unSelectAddressData.length > 0) {
            expandAllAddress(list);
        }
    }
    else {
        list.placeholder = showPlaceholder(list);
    }
    if (typeof list.options.callback === 'function') {
        list.options.callback();
    }
    list.checkPage();
    list.initialization = false;
};

let getData = (list) => {
    let ajaxOptions = {
        type: 'get',
        url: list.options.url,
        contentType: "application/json",
        data: list.options.data,
        success: (data) => {
            if (!data.success) {
                ajaxOptions.error();
            }
            else {
                addressData = data.result;
                createList(list);
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

class AddressEditList {
    constructor(options) {
        this.options = options;
        this.html = null;
        this.placeholder = null;
        this.length = 0;
        this.initialization = true;
        //所有地址的操作类型都统一，暂时不分别定制化
        this.actionHtml = null;
        getData(this);
    }

    addAddressItem(data, position, show) {
        this.length += 1;
        if (this.placeholder) {
            this.placeholder.remove();
            this.placeholder = null;
        }
        let container = null;
        if (show === false) {
            container = `tbody[data-type = 'hideItems']`;
        }
        else {
            container = `tbody[data-type = 'showItems']`;
        }
        //所有地址的操作类型都统一，暂时不分别定制化
        let hasAction = this.options.actions && this.options.actions.length > 0;
        let itemData = {
            hasAction: hasAction,
            data: data
        };
        let itemHtml = $(editListItem(itemData));
        switch (position) {
            case 'after':
                itemHtml.appendTo(this.html.find(container));
                break;
            case 'prev':
                itemHtml.prependTo(this.html.find(container));
                break;
            default:
                itemHtml.appendTo(this.html.find(container));
        }
        setSelectAction(itemData, itemHtml, this);
        if (!this.initialization) {
            updateAddressData(data, 'add');
            this.checkPage();
        }
    }

    modifyAddressItem(data) {
        updateAddressData(data, 'modify');
        //所有地址的操作类型都统一，暂时不分别定制化
        let hasAction = this.options.actions && this.options.actions.length > 0;
        let itemData = {
            hasAction: hasAction,
            data: data
        };
        let itemHtml = $(editListItem(itemData));
        let removeNode = this.html.find(`tbody tr[data-address-id = '${data.id}']`);
        if (!removeNode.next()[0]) {
            let parentNode = removeNode.parent();
            parentNode.append(itemHtml);
            console.log(1)
        }
        else {
            let nextNode = $(removeNode.next()[0]);
            nextNode.before(itemHtml);
            console.log(2)
        }
        removeNode.remove();
        setSelectAction(itemData, itemHtml, this);
        this.checkPage();
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

    checkPage() {
        Checker.formChecker(this.options.checker);
    }
}

module.exports = AddressEditList;