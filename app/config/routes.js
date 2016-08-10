var router = require('express').Router();

var controller;

var _init = function(baseController, auth) {
  controller = baseController;

  // dynamically generate routes from controller
  for (var c in controller) {
    if (controller.hasOwnProperty(c)) {
      if (typeof controller[c]['_routes'] !== 'undefined') {
        for (var route in controller[c]['_routes']) {
          var requiresAuth  = false;
          var components    = route.split(':');
          if (components[0].charAt(0) == '!') {
            components[0] = components[0].substr(1);
            requiresAuth = true;
          }
          var method        = router[components[0].toLowerCase()].bind(router);
          var path          = (c != 'static' ? '/' + c : '') + components[1];
          var handler       = controller[c][controller[c]['_routes'][route]];

          if (requiresAuth)
            method(path, auth, handler);
          else
            method(path, handler);
        }
      }
    }
  }

  // special routes lol
  router.post('/f/:shortcode', controller.tests.shareVariationFB);
  router.get('/f/:shortcode', controller.tests.clickVariationFB);
  router.get('/fe/:shortcode', controller.tests.emailShareVariationFB);

  router.post('/t/:shortcode', controller.tests.shareVariationTW);
  router.get('/t/:shortcode', controller.tests.clickVariationTW);
  router.get('/te/:shortcode', controller.tests.emailShareVariationTW);

  router.get('*', controller.pages.catchAll);
}

module.exports = {
  _init: _init,
  router: router
};
