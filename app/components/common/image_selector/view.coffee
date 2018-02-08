###
  by jsann.
###
Modal = require "pokeball/components/modal"

imageSelectorTemplates = Handlebars.templates["common/image_selector/templates/modal_image_selector"]
modalImageList = Handlebars.templates["common/image_selector/templates/modal_image_list"]
modalMenuList = Handlebars.templates["common/image_selector/templates/modal_menu"]
createFolderTemplates = Handlebars.templates["common/image_selector/templates/create_folder"]
folderTemplates = Handlebars.templates["common/image_selector/templates/folder"]

class ImageSelector

  constructor: ->
    @jsCreateFolder = ".js-create-folder"
    @createFolderForm = ".create-folder-form"
    @modalImageClass = ".modal-image-class li"
    @modalImageList = ".modal-image-list"
    @modalLocalList = ".modal-local-list"
    @bindEvent()

  bindEvent: ->
    @init()

  init: =>
    @imageSelectorModal = new Modal
      toggle: "image-selector"
      template: imageSelectorTemplates
      listTemplate: modalImageList
      listURL: "/api/reddeals/images/user"
      uploadURL: "/api/reddeals/images/upload?pathType=2&folderId=0"
      deleteURL: "/api/reddeals/images/"
      listParam: {pathType: 2, folderId: 0}
      refreshCallback: @refreshMenu

  show: (callback) =>
    @imageSelectorModal.show (url) =>
      callback(url)
    $(@jsCreateFolder).on "click", @createFolder
    $(@modalImageClass).on "click", @changeImageClass
    $(@modalImageList).on "click", "li[type=1]", @inFolder
    $(@modalImageList).on "click", ".js-folder-delete", @deleteFolder
    $(@modalLocalList).on "click", "a", @inFolder

  createFolder: =>
    @createFolderModal = new Modal(createFolderTemplates({data: {
      pathType: $(".modal-image-class").find("li.active").data("type")
      pid: $(".js-folder-id").val() || 0
    }}))
    @createFolderModal.show()
    $(@createFolderForm).on "submit", @createFolderSubmit

  createFolderSubmit: (event) =>
    event.preventDefault()
    $.ajax
      url: "/api/reddeals/images/createFolder"
      type: "POST"
      data: JSON.stringify $(event.currentTarget).serializeObject()
      contentType: "application/json"
      success: (data) =>
        $(".modal-image-list").append(folderTemplates({data: data}))
        @createFolderModal.close()

  inFolder: (event) =>
    $(".js-folder-id").val $(event.currentTarget).attr("id")
    $("#js-image-upload").fileupload
      url: "/api/reddeals/images/upload?pathType=" + $(".modal-image-class").find("li.active").data("type") + "&folderId=" + ($(".js-folder-id").val() || "")
    @imageSelectorModal.imageSelector.refresh(1, {
      folderId: $(event.currentTarget).attr("id")
      pathType: $(".modal-image-class").find("li.active").data("type")
    })

  deleteFolder: (event) =>
    new Modal
      icon: "confirm"
      isConfirm: true
      overlay: false
      title: "确认删除"
      content: "删除文件夹将会连同文件夹内的图片一起删除，并且不可恢复，您确定要继续？"
    .show =>
      $.ajax
        url: "/api/reddeals/images/#{$(event.currentTarget).data("id")}/folder"
        type: "DELETE"
        success: (data) =>
          @imageSelectorModal.imageSelector.refresh(1, {
            folderId: $(".js-folder-id").val()
            pathType: $(".modal-image-class").find("li.active").data("type")
          })
    return false

  changeImageClass: (event) =>
    $(".js-folder-id").val 0
    $(event.currentTarget).addClass("active").siblings().removeClass "active"
    @imageSelectorModal.imageSelector.refresh(1, {
      pathType: $(event.currentTarget).data("type")
    })
    $("#js-image-upload").fileupload
      url: "/api/reddeals/images/upload?pathType=" + $(".modal-image-class").find("li.active").data("type") + "&folderId=0"

  refreshMenu: (data) =>
    $(@modalLocalList).html modalMenuList({data: data.realPath.pathList})

module.exports = ImageSelector
