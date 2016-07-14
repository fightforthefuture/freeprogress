var error = require('../library/error');
var multiparty  = require('multiparty');

var model;

var _routes = {
  'POST:/schedule': 'scheduleEmailForUrl',
  'GET:/_test_send_mail': 'testSendMail',
}

var _init = function(baseModel) {
  model = baseModel;
}

var scheduleEmailForUrl = function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var data = req.body;

  model.Email.scheduleEmailForUrl(
    data.email,
    data.url,
    data.hours || 72,
    data.external_network,
    data.external_network_id,
    function(err, email) {
      if (err)
        return error.json(res, err.ref, err.data)

      console.log('scheduled email: ', email ? true : false);
      res.json('kthxbai');
    }
  );

}

var testSendMail = function(req, res) {
  sendMail = require("../library/mailer")(model._util.config);
  sendMail({
    to:       "jeff@fightforthefuture.org",
    from:     "jeff@fightforthefuture.org",
    fromName: "Free Progress",
    subject:  "This is a test.",
    body:     "<h1>lol</h1>"
  });
  res.json('kthxbai');
}

module.exports = {
  _init: _init,
  _routes: _routes,
  scheduleEmailForUrl: scheduleEmailForUrl,
  testSendMail: testSendMail
}
