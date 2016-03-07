var error = require('../library/error');

var model;

var _routes = {
  '!GET:/': 'getSites'
}

var _init = function(baseModel) {
  model = baseModel;
}

var getSites = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  res.json(['site lol']);
}

module.exports = {
  _init: _init,
  _routes: _routes,
  getSites: getSites
}
