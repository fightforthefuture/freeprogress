var multiparty  = require('multiparty');

module.exports = {
  parseForm: function(req, callback) {
    var form = new multiparty.Form();
    var data = {};

    form.parse(req, function(err, fields, files) {

      var data = {};

      for (var field in fields)
        if (fields.hasOwnProperty(field))
          data[field] = fields[field][0];

      callback(data);
    });
  },

  redirectShareTwitter: function(res, variation) {
    var text = encodeURIComponent(variation.tweet_text +' ' + variation.url);
    return res.redirect('https://twitter.com/intent/tweet?text='+text);
  },

  redirectShareFacebook: function(res, variation) {
    var url = encodeURIComponent(variation.url);
    return res.redirect('https://www.facebook.com/sharer.php?u='+url);
  }
}
