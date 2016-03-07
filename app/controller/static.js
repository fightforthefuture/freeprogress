var path = require('path');
var model;

var _routes = {
  '!GET:/admin': 'admin'
}

var _init = function(baseModel) {
  model = baseModel;
}

var admin = function(req, res) {
  "use strict";
  res.sendFile(path.join(__dirname, '../../public', 'fp-admin/index.html'));
}

module.exports = {
  _init: _init,
  _routes: _routes,
  admin: admin
}
