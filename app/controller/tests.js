var error = require('../library/error');
var multiparty  = require('multiparty');

var model;
var methods = {};

var _routes = {
  'GET:/': 'getTestForUrl',
  '!GET:/variation_tws': 'getVariationTWs',
  '!POST:/variation_tw': 'saveVariationTW',
  '!DELETE:/variation_tw': 'deleteVariationTW',
  '!GET:/variation_fbs': 'getVariationFBs',
  '!POST:/variation_fb': 'saveVariationFB',
  '!DELETE:/variation_fb': 'deleteVariationFB'
}

var _init = function(baseModel) {
  model = baseModel;
}

methods.getTestForUrl = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var url = req.query.url || req.headers.referer || null;

  if (!url)
    return error.json(res, 'TESTS_BAD_URL');

  model.Site.getSiteFromURL(url, function(err, site) {
    if (err)
      return error.json(res, err.ref, err.data)

    console.log('HERE IS YOUR RESPONSE LOL: ', site);

    res.json('bolo');
  });
}

methods.getVariationTWs = function(req, res) {
  _baseGetVariation(req, res, model.VariationTW, 'variation_tws');
}

methods.saveVariationTW = function(req, res) {
  _baseSaveVariation(req, res, model.VariationTW, 'variation_tw');
}

methods.deleteVariationTW = function(req, res) {
  _baseSaveVariation(req, res, model.VariationTW);
}

methods.getVariationFBs = function(req, res) {
  _baseGetVariation(req, res, model.VariationFB, 'variation_fbs');
}

methods.saveVariationFB = function(req, res) {
  _baseSaveVariation(req, res, model.VariationFB, 'variation_fb');
}

methods.deleteVariationFB = function(req, res) {
  _baseDeleteVariation(req, res, model.VariationFB);
}

var _baseGetVariation = function(req, res, targetModel, resultName) {
  res.set('Access-Control-Allow-Origin', '*');

  targetModel.findAll({
    where: {page_id: req.query.page_id}
  }).then(function(variation) {

    var result = {}
    result[resultName] = variation;

    res.json(result);
  });
}

var _baseSaveVariation = function(req, res, targetModel, resultName) {
  res.header("Access-Control-Allow-Origin", "*");

  var form = new multiparty.Form();
  var data = {};
  var result = {};
  var image;

  form.parse(req, function(err, fields, files) {

    var data = {};

    for (var field in fields)
      if (fields.hasOwnProperty(field))
        data[field] = fields[field][0];

    targetModel.saveBasicFields(data, function(err, created) {
      if (err)
        return error.json(res, err.ref)

      if (!data._imgData) {
        result[resultName] = created;
        return res.json(result);
      }

      targetModel.storeImg(created, data._imgData, function(err, updated){
        result[resultName] = updated;
        res.json(result);
      });
    });
  });
}

var _baseDeleteVariation = function(req, res, targetModel) {
  res.header("Access-Control-Allow-Origin", "*");

  var form = new multiparty.Form();
  var data = {};
  var image;

  form.parse(req, function(err, fields, files) {

    var data = {};

    for (var field in fields)
      if (fields.hasOwnProperty(field))
        data[field] = fields[field][0];

    targetModel.destroy({where: {id: data.id}}).then(function(status) {
      console.log('deleted ', status, 'rows');
      res.json('kthx');
    });
  });
}

module.exports = {
  _init: _init,
  _routes: _routes,
}
for (var route in _routes)
  if (_routes.hasOwnProperty(route))
    module.exports[_routes[route]] = methods[_routes[route]];
