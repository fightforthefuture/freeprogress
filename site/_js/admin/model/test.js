var Test = Composer.Model.extend({
});
var Test = Composer.Collection.extend({
  model: Test
});

var BaseVariation = Composer.Model.extend({
  save: function(data, callback) {
    console.log('saving: ', data);

    this.set(data);

    api.post(this.endpoint, this.toJSON(), function(err, result) {
      if (err)
        return callback(err, null)

      this.set(result[this.resultKey]);
      callback(null, this);
    }.bind(this));
  },

  destroy: function(callback) {
    api.delete(this.endpoint, this.toJSON(), function(err, result) {
      if (err)
        return callback(err, null);

      callback(null, true);
    });
  }
});

var BaseVariationCollection = Composer.Collection.extend({
  populateFromPage: function(page) {

    var query = {
      page_id: page.get('id'),
      lol: new Date().getTime()
    }

    api.get(this.endpoint, query, function(err, result) {
      if (err)
        return alert(err.msg);

      this.reset(result[this.resultKey]);
    }.bind(this));
    return this;
  }
});

var VariationTW = BaseVariation.extend({
  endpoint: '/tests/variation_tw',
  resultKey: 'variation_tw',
});
var VariationTWs = BaseVariationCollection.extend({
  model: VariationTW,
  resultKey: 'variation_tws',
  endpoint: '/tests/variation_tws'
});

var VariationFB = BaseVariation.extend({
  endpoint: '/tests/variation_fb',
  resultKey: 'variation_fb',
});
var VariationFBs = BaseVariationCollection.extend({
  model: VariationFB,
  resultKey: 'variation_fbs',
  endpoint: '/tests/variation_fbs'
});
