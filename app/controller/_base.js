var tests       = require('./tests');
var site       = require('./site');

var _init = function(model) {
    tests._init(model);
    site._init(model);
}

module.exports = {
  _init: _init,
  tests: tests,
  site: site
};
