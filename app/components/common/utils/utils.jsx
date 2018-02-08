
module.exports = {

  dateFormat:(date, fmt = 'yyyy-MM-dd') => {
    var o = {
      "M+" : date.getMonth() + 1,
      "d+" : date.getDate(),
      "h+" : date.getHours(),
      "m+" : date.getMinutes(),
      "s+" : date.getSeconds(),
      "q+" : Math.floor((date.getMonth() + 3) / 3),
      "S" : date.getMilliseconds()
    }

    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
    }

    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
      }
    }

    return fmt;

  },

  responseCheck:(response,func) => {
    if(!response.success){
        new Modal({
            icon: "error",
            isConfirm: false,
            content: response.message
        }).show();
        return false;
      }else{
        if(typeof(func)==='function'){
            func(response.result);
        }
    }
}
  

};
