var TestDashboardController = Composer.Controller.extend({

  page: null,
  variation_fbs: null,
  variation_tws: null,

  elements: {
    'div.variation_fbs': 'fb_list',
    'div.variation_tws': 'tw_list',
  },
  events: {
    'click a.new_variation_fb': 'newVariationFB',
    'click a.new_variation_tw': 'newVariationTW',
  },

  init: function() {
    this.render();
  },

  render: function() {
    this.html(TestDashboardView());

    this.variation_fbs = new VariationFBs().populateFromPage(this.page);
    this.variation_tws = new VariationTWs().populateFromPage(this.page);

    this.initList(TestVariationFBController, this.variation_fbs, this.fb_list);
    this.initList(TestVariationTWController, this.variation_tws, this.tw_list);

    this.el.className = 'test_dashboard';

  },

  initList: function(controller, collection, inject) {

    return new Composer.ListController({
      collection: collection,
      inject: inject,
      tag: 'ul',
      init: function() {
        this.track(this.collection, function(model, options) {
          var itemController = new controller({
            inject: this.el,
            model: model,
          });
          this.with_bind_once(itemController, 'deleted', function(model) {
            this.collection.remove(model);
          }.bind(this));
          this.with_bind(itemController, 'duplicate', function(model) {
            this.collection.add(model);
          }.bind(this));
          return itemController;
        }.bind(this), {bind_reset: true})
      }
    });
  },

  newVariationFB: function(e) {
    if (e)
      e.preventDefault();

    var controller = new TestVariationFBEditController({
      model: new VariationFB({
        page_id: this.page.get('id')
      })
    });
    this.with_bind_once(controller, 'saved', function(model) {
      console.log('adding model lol: ', model);
      this.variation_fbs.add(model);
    }.bind(this));
  },

  newVariationTW: function(e) {
    if (e)
      e.preventDefault();

    var controller = new TestVariationTWEditController({
      model: new VariationTW({
        page_id: this.page.get('id')
      })
    });
    this.with_bind_once(controller, 'saved', function(model) {
      console.log('adding model lol: ', model);
      this.variation_tws.add(model);
    }.bind(this));
  }
});
