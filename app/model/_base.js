var Sequelize   = require('sequelize');
var tests       = require('./tests');

var _init = function(db) {
    var sequelize = _initDB(db);

    tests._init(db.prefix, sequelize);

    sequelize.sync();
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
  _init: _init,
  tests: tests
};
