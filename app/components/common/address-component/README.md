# Address-component —— 与业务高度集成的地址组件
改组件封装了Address-edit和Address-show组件，与实际业务高度集成。

## 引入:
```
const Address = require('common/address-component/view');
```


## 实例化一个新组件:
```
new Address(options);
```

### options选项参数:
#### container:必选项，组件要挂载的位置（容器），参数为一个合法的jQuery选择器字符串，组件将在改选择器对应的dom下添加。
#### type:必选项，组件的类型，有两个可选值：'edit’、’show’。值为'edit’时，表明改组件可以编辑地址及其相关信息；值为’show’时，表明改组件仅用来展示相关地址。
#### module:必选项，组件所在的业务模块类型，有四个可选值：'protocol’、'inquiry’、'reverse’、'contract’，分别表示所在业务模块为：协议供货、在线询价、反向竞价、合同管理。
#### id:可选项，组件所在的页面id（如竞价单id），若为空，则取url中与id相关的参数（id、requireId）。
#### firstRender:可选项，改选项仅在type为'edit’时有效，当值为true时，表明组件所在的页面为用户第一次编辑，而不是保存后又继续编辑的状态。若未设定此值，且type为'edit'时，则取url中的firstRender参数，当值为'true'时，与设置选项为true时效果相同。若值不符合要求，则自动设置为false。
#### checker:可选项，组件所在页面提交时formChecker的选项，为一个对象。此选项仅在type为'edit'时有效。该对象有两个属性：1.container——指明包含当前页面所有需要提交校验的表单项的容器，2.target——指明与所有要提交校验表单项相关的元素，一般为提交按钮。这两个参数与formchecker的container和ctrlTarget相对应。

### 举例:
```
let addressComponent = new Address({
    container: '.address-container',
    type: 'edit',
    module: 'protocol',
    firstRender: true,
    checker: {
        container: '.panel',
        target: '#submit-audit-edit'
    }
});
```


## 组件方法

### getSubmitData()
该方法仅在type为'edit’时有效，调用时获取组件中需要提交的信息。当用户点击页面上保存按钮时可调用此方法。
返回值：一个对象，有以下两个属性：
    data: 要提交的数据，为一个数组，每一项代表一个地址
    totalQuantity: 所有要提交地址包含的货物数量的总和

#### 调用举例
```
let addressSubmitData = addressComponent.getSubmitData();
```

#### 返回值举例
```
{
    data: [],
    totalQuantity: 0
}
```

