var sites       = require('./sites');
var pages       = require('./pages');
var static      = require('./static');
var tests       = require('./tests');
var emails       = require('./emails');

var _init = function(model) {
    sites._init(model);
    pages._init(model);
    static._init(model);
    tests._init(model);
    emails._init(model);
}

module.exports = {
  _init: _init,
  sites: sites,
  pages: pages,
  static: static,
  tests: tests,
  emails: emails
};
