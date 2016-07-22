var basicAuth = require('basic-auth'),
    error = require('./error'),
    hash = require('sha.js');

var model = null,
    credentials = null,
    session = null;

module.exports = function(initializedModel, adminCredentials, sessionInfo) {
  model = initializedModel;
  credentials = adminCredentials;
  session = sessionInfo;

  return function (req, res, callback) {
    var unauthorized = function(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return error.json(res, 'USER_UNAUTHORIZED');
    };

    var user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    };

    var apiKeySeed = session.secret + credentials.user + credentials.pass,
        correctApiKey = hash('sha256').update(apiKeySeed).digest('hex');

    if (
      user.name === credentials.user && user.pass === credentials.pass
      ||
      user.name === 'api_key' && user.pass === correctApiKey
    ) {
      res.cookie('api_key', correctApiKey, { maxAge: 900000 });
      return callback();
    } else {
      return unauthorized(res);
    };
  };
}
