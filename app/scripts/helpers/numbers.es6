window.priceFormat = (price, bit) => {
  bit = bit || 2;
  if (typeof(price) === "string" && price !== "") {
    return (Number.parseFloat(price) / 100).toFixed(bit);
  } else if (typeof(price) === "number" && price !== NaN) {
    return Number.parseFloat(price / 100).toFixed(bit);
  } else {
    return price;
  }
}

window.centFormat = (price) => {
  if (typeof(price) === "string" && price !== "") {
    return Number.parseInt(Number.parseFloat(price) * 100).toFixed();
  } else if (typeof(price) === "number" && price !== NaN) {
    return (Number.parseInt(price * 100));
  } else {
    return price;
  }
}
Handlebars.registerHelper ("formatPriceYZG", function(price, options){
  if (price >= 10000){
    var formatedPrice = (price / 10000);
    if (formatedPrice == parseInt(formatedPrice))
      return formatedPrice.toFixed(2) + "万";
    else if (/^\d+\.\d$/.test(formatedPrice)){
      return formatedPrice.toFixed(2) + "万" ;
    }
    else{
      return formatedPrice + "万"
    }  
  }   
  else {
    return price;
  }    
});