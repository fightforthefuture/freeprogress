var Site = Composer.Model.extend({
});
var Sites = Composer.Collection.extend({
  model: Site,

  populate: function() {

    api.get('/sites', {}, function(err, sites) {
      if (err)
        return alert(err.msg);

      console.log('sites:', sites);
    });
    return this;
  }
});
