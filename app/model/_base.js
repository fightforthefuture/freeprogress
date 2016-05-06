var Sequelize       = require('sequelize');
var site            = require('./site');
var page            = require('./page');
var tests           = require('./tests');
var email           = require('./email');
var user_agent_log  = require('./user_agent_log');
var AWS             = require('aws-sdk');

var util = {
  config: {}
};

var _init = function(db, aws, config) {

    _initConfig(config);

    var sequelize               = _initDB(db);
    util.AWS                    = _initAWS(aws);
    module.exports._util        = util;
    module.exports._sequelize   = sequelize;
    module.exports._dbPrefix    = db.prefix;

    _export(site);
    _export(page);
    _export(tests);
    _export(user_agent_log);
    _export(email);

    sequelize.sync();
}

var _export = function(model) {
  model._init(module.exports);

  for (var exportable in model)
    if (model.hasOwnProperty(exportable))
      module.exports[exportable] = model[exportable];
}

var _initConfig = function(config) {
  for (setting in config)
    if (config.hasOwnProperty(setting))
      util.config[setting] = config[setting];
}

var _initDB = function(db) {
    return new Sequelize(
        db.name,
        db.user,
        db.pass, {
            host: db.host,
            port: db.port,
            dialect: 'postgres',
            dialectOptions: {
              ssl: true
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    );
}

var _initAWS = function(aws) {
  AWS.config.update({
      accessKeyId: aws.access_key,
      secretAccessKey: aws.secret_key
  });
  util.config.aws = {
    s3_bucket: aws.s3_bucket,
    s3_folder: aws.s3_folder
  };

  return AWS;
}

module.exports = {
  _init:      _init
};
