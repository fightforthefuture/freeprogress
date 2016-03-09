var error = require('../library/error');

var model;

var _routes = {
  '!GET:/': 'getPages'
}

var _init = function(baseModel) {
  model = baseModel;
}

var getPages = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  model.Page.findAll({
    where: {site_id: req.query.site_id},
    order: [['path', 'ASC']]
  }).then(function(pages) {
    console.log('pages: ', pages);
    res.json({pages: pages});
  });
}

module.exports = {
  _init: _init,
  _routes: _routes,
  getPages: getPages
}
