var BaseTestVariationEditController = BaseModalController.extend({

  imgData: null,

  init: function() {

    this.render();
    this.show();

  },

  handleFile: function() {
    if (this.imageInput.files && this.imageInput.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        this.imgData = e.target.result;
        this.imagePlaceholder.src = e.target.result;
      }.bind(this)

      reader.readAsDataURL(this.imageInput.files[0]);
    }
  },

  getBase64ImgData: function() {
    var imgData = this.imgData;
    if (imgData)
      return imgData.replace(/^data:image\/(png|jpg|jpeg);base64,/,"");
    else
      return;
  },

  submit: function(e) {

    this.submitButton.disabled = true;

    e.preventDefault();

    var data = this.grabFormData();

    var imgData = this.getBase64ImgData();

    if (imgData) {
      data._imgData = imgData;
    }

    this.model.save(data, function(err, result) {
      this.submitButton.disabled = false;

      if (err)
        return alert(err.msg);

      this.trigger('saved', result);

      this.hide();
    }.bind(this));
  }
});
