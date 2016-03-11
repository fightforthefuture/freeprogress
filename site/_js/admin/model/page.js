var Page = Composer.Model.extend({
});
var Pages = Composer.Collection.extend({
  model: Page,

  populateFromSite: function(site) {

    var query = {
      site_id: site.get('id'),
      lol: new Date().getTime()
    };

    api.get('/pages', query, function(err, result) {
      if (err)
        return alert(err.msg);

      this.reset(result.pages);
    }.bind(this));
    return this;
  }
});
