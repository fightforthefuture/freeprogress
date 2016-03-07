var Sequelize   = require('sequelize');
var site        = require('./site');
var page        = require('./page');
var tests       = require('./tests');

var _init = function(db) {
    var sequelize               = _initDB(db);
    module.exports._sequelize   = sequelize;
    module.exports._dbPrefix    = db.prefix;

    _export(site);
    _export(page);
    _export(tests);

    sequelize.sync();
}

var _export = function(model) {
  model._init(module.exports);

  for (var exportable in model)
    if (model.hasOwnProperty(exportable))
      module.exports[exportable] = model[exportable];
}

var _initDB = function(db) {
    return new Sequelize(
        db.name,
        db.user,
        db.pass, {
            host: db.host,
            port: db.port,
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    );
}

module.exports = {
  _init:      _init
};
