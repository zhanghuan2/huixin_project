## FormChecker

前端项目表单验证

### 例子1  简单模式
需要使用表单验证的可如下实现
container: 是表单最外面的那层容器，不建议用form
ctrlTarget: 是控制使能的对象，一般会是个btn
precheck: 如果是编辑，可以通过true来检查一发

```html
  <div class="panel">
    <input type="text" checker-type="mobile">
    <button id="btn-test" class="btn btn-primary btn-medium" disabled>提交</button>
  </div>
  ...
```
```javascript
  var checker = require("common/formchecker/extend");
  ...
  checker.formChecker({container: '.panel', ctrlTarget: '#btn-test'});
```
### 例子2 注册一个check-type类型
extendChecks: 自定义的checker, 可以自己做一些特殊的操作。是一个数组
```html
  <div class="panel">
    <input type="text" checker-type="name" placeholder="" >
  </div>
  ...
```
```javascript
  var checker = require("common/formchecker/extend");
  ...
  checker.formChecker({
    container: '.panel',
    ctrlTarget: '#register',
    precheck: true,
    extendChecks: [
      {
        type : "name",
        errorText : "错误提示",
        check : function (self, object) { // self是check对象，Object是input对象
          var result;
          $.ajax({
            type: "GET",
            async: false,
            url: "/api/...,
            success : function (data) {
              result = (true === data.result) ? true : self.errorText;
            }
          });
          return result; // 返回true或这是要提示的错误文字
        }
      }
    ]
  });
```
### 例子3 多表单校验
通过创建实例，来使用formchecker。适用于一个页面有多个checker的情况
```javascript
  var checker = require("common/formchecker/prototype");
  ...
  var checker1 = new checkerProto({container: '#div-1', ctrlTarget: '#btn-test1'});
  var checker2 = new checkerProto({container: '#div-2', ctrlTarget: '#btn-test2'});
```

### 通用检查checker-type
表单验证通过checker-type来决定使用哪种规则来进行校验。
```html
  <input checker-type="mobile">
  <input checker-type="email">
  <input checker-type="url">
```
### pattern
表单验证通过自定义的pattern来决定使用哪种规则来进行校验。
```html
  <input checker-pattern="[a-zA-Z]", checker-text="输入不是英文字母">
```
### icon
默认带icon提示，如果不想要icon提示就false一下
```html
  <input checker-type="mobile" icon="false">
```
### checker-text
默认带text提示，如果不想要text提示就false一下
```html
  <input checker-type="mobile" checker-text="false">
```
### required
和html5的required特性一样。如果是required的表单
```html
  <input required>
```
### max-length,mix-length
如果需要限制表单长度
```html
  <input min-length="4" max-length="20">
```
### input-append
如果需要在input后面紧跟一个标签显示，给一个input-append的class,这样提示信息会跳过这个标签显示在其后
```html
  <input type="text" checker-type="mobile" icon="false">
  <span class="input-append">
    <button id="verification-btn" class="btn" type="button">获取验证码</button>
  </span>
```
### checker-compare
如果需要比较多个input的话，可以使用checker-compare，checker-compare会比较其value值相同的input
```html
  <input name="" type="password" checker-compare="password" required>
  <input name="" type="password" checker-compare="password" checker-text="" required>
```

### doRevert() 
去除表单检查的状态(输入是一个Jquery选择器)
```html
  输入框从 <input required> 变成了 <input>
  从此需要告诉formchecker. 恢复到原先的状态
```
```javascript
  var checker = require("common/formchecker/extend");
  ...
  checker.doRevert($('.class'));
```
