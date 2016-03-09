var TestVariationFBController = BaseTestVariationController.extend({
  tag: 'li',
  model: null,
  elements: {
  },
  events: {
    'click a.edit': 'edit',
    'click a.delete': 'delete'
  },

  render: function() {
    var html = TestVariationFBView(this.model.toJSON());
    this.html(html);

    this.assignDisplayClasses();
  },

  edit: function(e) {
    if (e)
      e.preventDefault();

    new TestVariationFBEditController({model: this.model});
  }
});
