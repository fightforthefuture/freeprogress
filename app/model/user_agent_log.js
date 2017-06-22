var Sequelize   = require('sequelize');

var model = null;

var _init = function(baseModel) {

  model = baseModel;

  var UserAgentLog = baseModel._sequelize.define('site',
    {
      user_agent: {
        type: Sequelize.STRING,
        unique: false
      },
      create_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      mod_date: {
        type: Sequelize.DATE
      },
    },
    {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: baseModel._dbPrefix + 'user_agent_log',
      classMethods: {

        
      }
    }
  );

  module.exports.UserAgentLog = UserAgentLog;
}

module.exports = { _init: _init };
