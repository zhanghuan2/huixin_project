var UploadFile = require("common/uploadFile/extend");
module.exports ={
  uploadFile: undefined,
  bindChange: function(busiCode,getKeyAPI,downloadUrl){
    if (this.uploadFile == undefined) {
      this.uploadFile = new UploadFile(busiCode,getKeyAPI,downloadUrl);
    }
  },

  getFiles: function(){
    return this.uploadFile.getFiles();
  }

};
