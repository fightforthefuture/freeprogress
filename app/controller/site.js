var path = require('path');
var model;

var _routes = {
  'GET:/': 'index'
}

var _init = function(baseModel) {
  model = baseModel;
}

var index = function(req, res) {
  "use strict";
  res.sendFile(path.join(__dirname, '../public', 'index.html', 'index.html'));
}

module.exports = {
  _init: _init,
  _routes: _routes,
  index: index
}
