var TestVariationFBController = BaseTestVariationController.extend({
  tag: 'li',
  model: null,
  elements: {
  },
  events: {
    'click a.edit': 'edit',
    'click a.delete': 'delete',
    'click a.duplicate': 'duplicate'
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
  },

  duplicate: function(e) {
    if (e)
      e.preventDefault();

    var dup = new TestVariationFBEditController({model:this.model.duplicate()});
    this.bindDuplicateSave(dup);
  }
});
