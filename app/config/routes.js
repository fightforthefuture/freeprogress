var router = require('express').Router();

var controller;

var _init = function(baseController) {
  controller = baseController;

  // dynamically generate routes from controller
  for (var c in controller) {
    if (controller.hasOwnProperty(c)) {
      if (typeof controller[c]['_routes'] !== 'undefined') {
        for (var route in controller[c]['_routes']) {
          var components  = route.split(':');
          var method      = router[components[0].toLowerCase()].bind(router);
          var path        = '/'+ c + components[1];
          var handler     = controller[c][controller[c]['_routes'][route]];
          method(path, handler)
        }
      }
    }
  }
}

module.exports = {
  _init: _init,
  router: router
};
