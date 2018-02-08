const EditAddress = require('common/address-edit/view');
const ShowAddress = require('common/address-show/view');

const getId = (options) => {
  let id = null;
  if (options.id) {
    id = options.id;
  } else if ($.query.get('id')) {
    id = $.query.get('id');
  } else if ($.query.get('requireId')) {
      id = $.query.get('requireId');
    } else {
      console.log('Address组件无id参数！');
    }
  return id;
};

const isFirstRender = (options) => {
  let isFirstRender = null;
  if (options.hasOwnProperty('firstRender')) {
    if (options.firstRender === true) {
      isFirstRender = true;
    } else {
      isFirstRender = false;
    }
  } else if ($.query.get('firstRender') === 'true') {
    isFirstRender = true;
  } else {
    isFirstRender = false;
  }
  return isFirstRender;
};

const getSubmitData = (component) => {
  const id = getId(component.options);
  if (id === null) { return; }
  const result = {
    data: [],
    totalQuantity: null
  };
  const data = component.content.getAddressData('select');
  switch (component.options.module) {
    case 'protocol':
      result.data = data.map(item => ({
        requireId: id,
        receiverAddrId: item.id,
        deliveryQuantity: item.quantity,
        remark: item.remark
      }));
      break;
    case 'inquiry':
      result.data = data.map(item => ({
        deliveryId: item.id,
        deliveryQuantity: item.quantity,
        remark: item.remark
      }));
      break;
    case 'reverse':
      result.data = data.map(item => ({
        deliveryId: item.id,
        quantity: item.quantity,
        remark: item.remark,
        provinceCode: item.provinceCode,
        provinceName: item.province,
        cityCode: item.cityCode,
        cityName: item.city,
        regionCode: item.regionCode,
        regionName: item.region,
        streetCode: item.streetCode,
        streetName: item.street,
        details: item.details,
        postCode: item.zip,
        contactName: item.receiverName,
        contactPhone: item.mobile,
        contactNumber: item.fullPhone,
        id: item.businessId
      }));
      break;
  }
  result.totalQuantity = data.reduce((total, item) => total + Number(item.quantity), 0);
  return result;
};

const setAjaxOptions = (options) => {
  let url = null;
  const data = {};
  const id = getId(options);
  if (id === null) { return null; }
  switch (options.module) {
    case 'protocol':
      url = '/api/protocol/delivery/getAsDeliveries';
      data.requireId = id;
      break;
    case 'inquiry':
      url = '/api/inquiry/address/getOiDeliveries';
      data.orderId = id;
      break;
    case 'reverse':
      url = '/api/reverse/address/getRaDeliveries';
      data.requireId = id;
      break;
    case 'contract':
      url = '/vienna/api/contract/address/getCmDeliveries';
      data.contractId = id;
      break;
    default:
      console.log('Address组件module参数错误！');
      return null;
  }
  switch (options.type) {
    case 'edit':
      data.onlySelected = false;
      break;
    case 'show':
      if (options.module !== 'contract') {
        data.onlySelected = true;
      }
      break;
    default:
      console.log('Address组件type参数错误！');
      return null;
  }
  return {
    url,
    data
  };
};

const setRenderOptions = (options) => {
  const firstRender = isFirstRender(options);
  const config = {
    container: options.container
  };
  let func = null;
  switch (options.type) {
    case 'edit':
      config.maxLength = 100;
      config.firstRender = firstRender;
      config.checker = {
        container: options.checker.container,
        ctrlTarget: options.checker.target,
        precheck: true
      };
      func = EditAddress;
      break;
    case 'show':
      func = ShowAddress;
      break;
  }
  return {
    config,
    func
  };
};

const createComponent = (component) => {
  const ajaxOptions = setAjaxOptions(component.options);
  if (ajaxOptions === null) { return; }
  const renderOptions = setRenderOptions(component.options);
  const options = renderOptions.config;
  options.url = ajaxOptions.url;
  options.data = ajaxOptions.data;
  const renderFunc = renderOptions.func;
  component.content = new renderFunc(options);
};

class AddressComponent {
  constructor (options) {
    this.options = options;
    this.content = null;
    createComponent(this);
  }

  getSubmitData () {
    let data = null;
    switch (this.options.type) {
      case 'edit':
        data = getSubmitData(this);
        break;
      default:
        console.log('只有在数量和备注可编辑的状态下获取提交数据！');
    }
    return data;
  }
}

module.exports = AddressComponent;
