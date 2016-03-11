var error = require('../library/error');

var model;
var methods = {};

var _routes = {
  '!GET:/': 'getPages',
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
