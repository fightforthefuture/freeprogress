var basicAuth = require('basic-auth');
var error = require('./error');

var model = null;

module.exports = function(initializedModel) {
  model = initializedModel;

  return function (req, res, callback) {
    var unauthorized = function(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return error.json(res, 'USER_UNAUTHORIZED');
    };

    var user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    };

    if (
      user.name === 'foo' && user.pass === 'bar'
      ||
      user.name === 'api_key' && user.pass === 'lol'
    ) {
      res.cookie('api_key', 'lol', { maxAge: 900000 });
      return callback();
    } else {
      return unauthorized(res);
    };
  };
}
