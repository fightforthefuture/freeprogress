var express = require('express');
var session = require('express-session');
var compression = require('compression');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var RedisStore = require('connect-redis')(session);
var keys = require('./config/keys');
var path = require('path');
var model = require('./model/_base');
var controller = require('./controller/_base');
var routes = require('./config/routes');

model._init(keys.db, keys.aws, keys.config); // Initialize model from keys
controller._init(model);                     // Initialize controller from model
var auth = require('./library/auth')(model); // Initialize security from model
routes._init(controller, auth);              // Init router from controller

var sessionInfo = {
  secret: keys.session.secret,
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 600000}
};

if (keys.redis !== undefined) {
  sessionInfo.store = new RedisStore({
    url: keys.redis.url
  });
}

app.use(compression({
  level: 6
}));

app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: function (res, path) {
    "use strict";

    if (keys.environment && keys.environment !== 'development') {
      if (path.indexOf('.css') !== -1 || path.indexOf('.js') !== -1) {
        res.setHeader("Cache-Control", "public, max-age=31540000");
      }
    }
  }
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session(sessionInfo));
app.use(routes.router);
app.listen(keys.port);

if (keys.environment === undefined || keys.environment === 'development') {
  console.log('‼️  Server running at http://0.0.0.0:' + keys.port + ' ‼️');
  console.log('(if you’re running iTerm2, ⌘ + click ☝️ )');
}
