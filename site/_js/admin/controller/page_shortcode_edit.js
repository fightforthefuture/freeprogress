var PageShortcodeEditController = BaseModalController.extend({

  type: null,

  elements: {
    'input': 'shortcode',
    'button': 'submitButton'
  },

  events: {
    'submit form': 'submit'
  },

  init: function() {

    this.render();
    this.show();

  },

  render: function() {
    var overlay = this.base_render();
    var data    = this.model.toJSON();

    data.type = this.type;

    if (this.type == 'Twitter')
      data.shortcode = data.shortcode_tw;
    else
      data.shortcode = data.shortcode_fb;

    var view    = PageShortcodeEditView(data);

    overlay.firstChild.appendChild(view);

    this.html(overlay);
  },

  submit: function(e) {

    this.submitButton.disabled = true;

    e.preventDefault();

    if (this.type == 'Twitter')
      var data = {shortcode_tw: this.shortcode.value};
    else
      var data = {shortcode_fb: this.shortcode.value};

    console.log('data:', data);

    this.model.save(data, function(err, result) {
      this.submitButton.disabled = false;

      if (err)
        return alert(err.msg);

      this.trigger('saved', data);
      this.hide();
    }.bind(this));

  }
});
