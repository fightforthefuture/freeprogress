var error = require('../library/error');

var model;

var _routes = {
  'GET:/': 'getTestForUrl'
}

var _init = function(baseModel) {
  model = baseModel;
}

var getTestForUrl = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var url = req.query.url || req.headers.referer || null;

  if (!url)
    return error.json(res, 'TESTS_BAD_URL');

  model.tests.Site.getSiteFromURL(url, function(err, site) {
    if (err)
      return error.json(res, err.ref, err.data)

    res.json('bolo');
  });
}

module.exports = {
  _init: _init,
  _routes: _routes,
  getTestForUrl: getTestForUrl
}
