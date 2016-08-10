var Page = Composer.Model.extend({
  save: function(data, callback) {
    console.log('saving: ', data);

    this.set(data);

    api.post('/pages', this.toJSON(), function(err, result) {
      if (err)
        return callback(err, null)

      this.set(result['page']);
      callback(null, this);
    }.bind(this));
  },
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
