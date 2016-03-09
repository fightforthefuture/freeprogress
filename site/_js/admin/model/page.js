var Page = Composer.Model.extend({
});
var Pages = Composer.Collection.extend({
  model: Page,

  populateFromSite: function(site) {

    api.get('/pages', {site_id: site.get('id')}, function(err, result) {
      if (err)
        return alert(err.msg);

      this.reset(result.pages);
    }.bind(this));
    return this;
  }
});
