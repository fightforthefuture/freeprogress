var PageListController = Composer.ListController.extend({
    elements: {
      'ul': 'list'
    },

    events: {
    },

    site: null,
    collection: null,

    init: function() {

        this.render();

        this.collection = new Pages().populateFromSite(this.site);

        this.track(this.collection, function(model, options) {
          return new PageItemController({
            inject: this.list,
            model: model
          });

        }.bind(this));
    },

    render: function() {
        var html = PageListView({
        });
        this.html(html);
    }
});
