class Calendar {
  constructor() {
    var date = new Date();
    $("div.title").html(date.getFullYear() + "." + (date.getMonth() + 1));
    $("div.body").html(date.getDate());
  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}
module.exports = Calendar;