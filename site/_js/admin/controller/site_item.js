var SiteItemController = Composer.Controller.extend({
  tag: 'li',
  model: null,
  subViewController: null,
  elements: {
    'div': 'subView'
  },
  events: {
    'click a.site': 'viewSite'
  },

  init: function() {
    this.render();
  },

  render: function() {
    var html = SiteItemView(this.model.toJSON());
    this.html(html);
  },

  viewSite: function(e) {
    if (e)
      e.preventDefault();

    if (this.subViewController) {
      this.subViewController.release();
      return this.subViewController = null;
    }

    this.subViewController = new PageListController({
      site: this.model,
      inject: this.subView
    });
  }
});
