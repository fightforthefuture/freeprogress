var PageItemController = Composer.Controller.extend({
  tag: 'li',
  model: null,
  subViewController: null,
  elements: {
    'div': 'subView'
  },
  events: {
    'click a.page': 'viewPage'
  },

  init: function() {
    this.render();
  },

  render: function() {
    var html = PageItemView(this.model.toJSON());
    this.html(html);
  },

  viewPage: function(e) {
    if (e)
      e.preventDefault();

    if (this.subViewController) {
      this.subViewController.release();
      return this.subViewController = null;
    }

    this.subViewController = new TestDashboardController({
      page: this.model,
      inject: this.subView
    });
  }
});
