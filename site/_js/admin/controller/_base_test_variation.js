var BaseTestVariationController = Composer.Controller.extend({

  init: function() {
    this.with_bind(this.model, 'change', this.render.bind(this));
    this.render();
  },

  assignDisplayClasses: function() {
    this.el.classList.remove('active');
    this.el.classList.remove('default');

    if (this.model.get('active'))
      this.el.classList.add('active');

    if (this.model.get('default'))
      this.el.classList.add('default');
  },

  delete: function(e) {
    if (e)
      e.preventDefault();

    if (confirm('Are you sure and whatever.')) {
      this.model.destroy(function(err, success) {
        if (err)
          return alert('Couldn\'t actually delete. WTF? ? Reload or something');
      });
      this.trigger('deleted', this.model);
    }
  }
});
