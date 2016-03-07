var sites       = require('./sites');
var static       = require('./static');
var tests       = require('./tests');

var _init = function(model) {
    sites._init(model);
    static._init(model);
    tests._init(model);
}

module.exports = {
  _init: _init,
  sites: sites,
  static: static,
  tests: tests
};
