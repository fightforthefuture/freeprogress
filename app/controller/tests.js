var error       = require('../library/error');
var multiparty  = require('multiparty');
var template    = require('swig');

var model;
var methods = {};

template.setDefaults({
  cache: false,   // JL DEBUG ~ turn off template caching.
  autoescape: true
});

var _routes = {
  'GET:/': 'getTestForUrl',
  'GET:/click_variation_tw':        'clickVariationTW',
  'GET:/click_variation_fb':        'clickVariationFB',
  'POST:/share_variation_tw':       'shareVariationTW',
  'POST:/share_variation_fb':       'shareVariationFB',
  'POST:/convert_variation_tw':     'convertVariationTW',
  'POST:/convert_variation_fb':     'convertVariationFB',
  'GET:/email_share_variation_fb':  'emailShareVariationFB',
  'GET:/email_share_variation_tw':  'emailShareVariationTW',
  '!GET:/variation_tws':            'getVariationTWs',
  '!POST:/variation_tw':            'saveVariationTW',
  '!DELETE:/variation_tw':          'deleteVariationTW',
  '!GET:/variation_fbs':            'getVariationFBs',
  '!POST:/variation_fb':            'saveVariationFB',
  '!DELETE:/variation_fb':          'deleteVariationFB',
}

var _init = function(baseModel) {
  model = baseModel;
}

methods.getVariationTWs = function(req, res) {
  _baseGetVariation(req, res, model.VariationTW, 'variation_tws');
}

methods.saveVariationTW = function(req, res) {
  _baseSaveVariation(req, res, model.VariationTW, 'variation_tw');
}

methods.deleteVariationTW = function(req, res) {
  _baseSaveVariation(req, res, model.VariationTW);
}

methods.shareVariationTW = function(req, res) {
  _baseShareVariation(req, res, model.VariationTW);
};

methods.clickVariationTW = function(req, res) {
  _baseClickVariation(req, res, model.VariationTW, 'variation_tw');
};

methods.convertVariationTW = function(req, res) {
  _baseConvertVariation(req, res, model.VariationTW);
};

methods.emailShareVariationTW = function(req, res) {
  model.VariationTW.getByShortcode(req.params.shortcode, function(variation) {

    if (!variation)
      return error.json(res, 'TESTS_BAD_SHORTCODE');

    model.VariationTW.logShare(variation.id);
    var text = encodeURIComponent(variation.tweet_text +' ' + variation.url);
    res.redirect('https://twitter.com/intent/tweet?text='+text);
  });
};

methods.getVariationFBs = function(req, res) {
  _baseGetVariation(req, res, model.VariationFB, 'variation_fbs');
}

methods.saveVariationFB = function(req, res) {
  _baseSaveVariation(req, res, model.VariationFB, 'variation_fb');
}

methods.deleteVariationFB = function(req, res) {
  _baseDeleteVariation(req, res, model.VariationFB);
}

methods.shareVariationFB = function(req, res) {
  _baseShareVariation(req, res, model.VariationFB);
};

methods.clickVariationFB = function(req, res) {
  _baseClickVariation(req, res, model.VariationFB, 'variation_fb');
};

methods.convertVariationFB = function(req, res) {
  _baseConvertVariation(req, res, model.VariationFB);
};

methods.emailShareVariationFB = function(req, res) {
  model.VariationFB.getByShortcode(req.params.shortcode, function(variation) {

    if (!variation)
      return error.json(res, 'TESTS_BAD_SHORTCODE');

    model.VariationFB.logShare(variation.id);
    var url = encodeURIComponent(variation.url);
    res.redirect('https://www.facebook.com/sharer.php?u='+url);
  });
};

methods.getTestForUrl = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var url = req.query.url || req.headers.referer || null;

  if (!url)
    return error.json(res, 'TESTS_BAD_URL');

  model.Site.getSiteFromURL(url, function(err, site) {
    if (err)
      return error.json(res, err.ref, err.data)

    var page = site.pages[0];

    model.VariationTW.getRandomVariation(page, {}, function(variation_tw) {
      model.VariationFB.getRandomVariation(page, {}, function(variation_fb) {
        res.json({
          variation_fb: variation_fb,
          variation_tw: variation_tw
        });
      });
    });
  });
}

var _parseForm = function(req, callback) {
  var form = new multiparty.Form();
  var data = {};

  form.parse(req, function(err, fields, files) {

    var data = {};

    for (var field in fields)
      if (fields.hasOwnProperty(field))
        data[field] = fields[field][0];

    callback(data);
  });
};

var _baseGetVariation = function(req, res, targetModel, resultKey) {
  res.set('Access-Control-Allow-Origin', '*');

  targetModel.findAll({
    where: {page_id: req.query.page_id},
    order: 'create_date ASC'
  }).then(function(variation) {

    var result = {}
    result[resultKey] = variation;

    res.json(result);
  });
}

var _baseSaveVariation = function(req, res, targetModel, resultKey) {
  res.header("Access-Control-Allow-Origin", "*");
  var result = {};

  _parseForm(req, function(data) {

    targetModel.saveBasicFields(data, function(err, created) {
      if (err)
        return error.json(res, err.ref)

      if (!data._imgData) {
        result[resultKey] = created;
        return res.json(result);
      }

      targetModel.storeImg(created, data._imgData, function(err, updated){
        result[resultKey] = updated;
        res.json(result);
      });
    });
  });
}

var _baseDeleteVariation = function(req, res, targetModel) {
  res.header("Access-Control-Allow-Origin", "*");
  var result = {};

  _parseForm(req, function(data) {

    targetModel.destroy({where: {id: data.id}}).then(function(status) {
      console.log('deleted ', status, 'rows');
      res.json('kthx');
    });
  });
}

var _baseShareVariation = function(req, res, targetModel) {
  targetModel.getByShortcode(req.params.shortcode, function(variation) {

    if (!variation)
      return error.json(res, 'TESTS_BAD_SHORTCODE');

    targetModel.logShare(variation.id);
    res.json('lol');
  });
}

var _baseClickVariation = function(req, res, targetModel, pageTemplate) {
  targetModel.getByShortcode(req.params.shortcode, function(variation) {

    if (!variation)
      return error.json(res, 'TESTS_BAD_SHORTCODE');

    var shouldLogClick  = true;
    var user_agent      = req.headers['user-agent'] || '(none)';

    // never trust the client.

    // JL NOTE ~ disable cookies because Privacy Badger :'(
    // try {
    //   var clicks = req.cookies.c ? JSON.parse(req.cookies.c) : [];
    // } catch(err) {
    //   var clicks = [];
    // }
    //
    // if (clicks)
    //   for (var i = 0; i < clicks.length; i++)
    //     if (clicks[i] == variation.shortcode)
    //       shouldLogClick = false;

    if (!variation.active)
      shouldLogClick = false;

    if (shouldLogClick) {

      // JL NOTE ~ disable cookies because Privacy Badger :'(
      // clicks.push(variation.shortcode);
      // res.cookie('c', JSON.stringify(clicks), {
      //   expires: new Date(Date.now() + 900000)
      // });

      targetModel.logClick(variation.id);

      model.UserAgentLog.create({ user_agent: user_agent });
    }

    variation.config = model._util.config;

    var tmpl = template.compileFile('app/templates/'+pageTemplate+'.html');
    res.send(tmpl(variation));
  });
};

var _baseConvertVariation = function(req, res, targetModel) {
  res.header("Access-Control-Allow-Origin", "*");

  _parseForm(req, function(data) {
    targetModel.getByShortcode(data.shortcode, function(variation) {

      if (!variation)
        return error.json(res, 'TESTS_BAD_SHORTCODE');

      targetModel.logConvert(variation.id);
      res.json('lol');
    });
  });
}

module.exports = {
  _init: _init,
  _routes: _routes,
}
for (var route in _routes)
  if (_routes.hasOwnProperty(route))
    module.exports[_routes[route]] = methods[_routes[route]];
