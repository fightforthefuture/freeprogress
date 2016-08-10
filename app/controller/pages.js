var error = require('../library/error');
var util  = require('../library/util');

var model;
var methods = {};

var _routes = {
  '!GET:/': 'getPages',
  '!POST:/': 'savePage',
  '!GET:/catch_all': 'catchAll',
  'GET:/_debug_test_self_select': '_debugTestSelfSelect',
}

var _init = function(baseModel) {
  model = baseModel;
}

methods.getPages = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  model.Page.findAll({
    where: {site_id: req.query.site_id},
    order: [['path', 'ASC']]
  }).then(function(pages) {
    res.json({pages: pages});
  });
}

methods.savePage = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  util.parseForm(req, function(data) {
    model.Page.saveBasicFields(data, function(err, page) {
      if (err)
        return error.json(res, err.ref)

      res.json({page: page});
    });
  });
};

methods.catchAll = function(req, res) {

  var shortcode = req.path.substr(1);

  model.Page.getByShortcode(shortcode, function(page) {
    if (!page)
      return res.send('<h1>omg 404 lol</h1><p>wtf</p>', 404);

    if (page.shortcode_tw == shortcode) {
      var variationModel = model.VariationTW;
      var shareRedirect  = util.redirectShareTwitter;
    } else {
      var variationModel = model.VariationFB;
      var shareRedirect  = util.redirectShareFacebook;
    }

    variationModel.getRandomVariation(page, {}, function(variation) {

      if (!variation)
        return res.send('<h1>lopfl 404 wtf</h1><p>omg omg omg</p>', 404);

      variationModel.logShare(variation.id);

      return shareRedirect(res, variation);
    });
  });

};

methods._debugTestSelfSelect = function(req, res) {
  model.Page.runVariationTests();
  res.json('Consult your friendly local console lol');
}

module.exports = {
  _init: _init,
  _routes: _routes,
}
for (var route in _routes)
  if (_routes.hasOwnProperty(route))
    module.exports[_routes[route]] = methods[_routes[route]];
