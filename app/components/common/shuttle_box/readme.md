## shuttle_box

前端项目穿梭框
_TYPE_ : array/tree // 选择项的结构，是树还是数组 然而数组现在还没有支持

  参数名 |  说明 | 必填 | 类型 | 备注 
  -------|-------|------|------|------
  type |   定义穿梭框中的结构。 | 否 |     字符串 |        默认是树 | 
  selected |   已选定的内容 | 否 |     数组 |        参见例子1 | 

### 例子1  树
```html
  {{inject "common/shuttle_box" _DATA_TREE_=_CATEGORY_ _TYPE_="tree"}}
  ...
```
```javascript
  var shuttle = require("common/shuttle_box/extend");
  ...
   var Shuttle = new shuttle({
    type: 'tree',
    selected : [{"id": "28", "name": "保险箱/柜"} ] 
  });

  /* 取最终选完的数据 */
  $('#btn').bind('click', function () {
    var data = Shuttle.getSelected()
    console.log(JSON.stringify(data));
  })  
```

