var Site = Composer.Model.extend({
});
var Sites = Composer.Collection.extend({
  model: Site,

  populate: function() {

    api.get('/sites', {}, function(err, result) {
      if (err)
        return alert(err.msg);

      this.reset(result.sites);
    }.bind(this));
    return this;
  }
});
