var TestVariationTWController = BaseTestVariationController.extend({
  tag: 'li',
  model: null,
  elements: {
  },
  events: {
    'click a.edit': 'edit',
    'click a.delete': 'delete'
  },

  render: function() {
    var html = TestVariationTWView(this.model.toJSON());
    this.html(html);

    this.assignDisplayClasses();
  },

  edit: function(e) {
    if (e)
      e.preventDefault();

    new TestVariationTWEditController({model: this.model});
  }
});
