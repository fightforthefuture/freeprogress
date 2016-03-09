var SiteListController = Composer.ListController.extend({
    elements: {
      'ul': 'list'
    },

    events: {
    },

    collection: null,

    init: function() {

        this.render();

        this.collection = new Sites().populate();

        this.track(this.collection, function(model, options) {
          return new SiteItemController({
            inject: this.list,
            model: model
          });

        }.bind(this));
    },

    render: function() {
      var html = SiteListView({
      });
      this.html(html);
    }
});
