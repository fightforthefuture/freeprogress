var Sequelize   = require('sequelize');
var jsdom = require("node-jsdom");

var model = null;

var _init = function(baseModel) {

  model = baseModel;

  var VariationFB = baseModel._sequelize.define('variation_fb',
    {
      page_id: {
        type: Sequelize.BIGINT,
          references: {
          model: model.Page,
          key: "id"
        }
      },
      site_name: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
      tableName: baseModel._dbPrefix + 'variation_fb',
      classMethods: {

        /**
         *  Creates a variation from a data object
         */
        createFromData: function(variation, callback) {
          VariationFB.create(variation).then(function(variation) {
            callback(variation);
          });
        }
      }
    }
  );

  var VariationTW = baseModel._sequelize.define('variation_tw',
    {
      page_id: {
        type: Sequelize.BIGINT,
          references: {
          model: model.Page,
          key: "id"
        }
      },
      tweet_text: {
        type: Sequelize.STRING
      },
      site: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
      tableName: baseModel._dbPrefix + 'variation_tw',
      classMethods: {

        /**
         *  Creates a variation from a data object
         */
        createFromData: function(variation, callback) {
          VariationTW.create(variation).then(function(variation) {
            callback(variation);
          });
        }
      }
    }
  );

  console.log('model: ', model);

  VariationTW.belongsTo(model.Page, {
    through: {
      model: VariationTW,
      unique: false,
    },
    foreignKey: 'page_id'
  });
  model.Page.hasMany(VariationTW);

  VariationFB.belongsTo(model.Page, {
    through: {
      model: VariationFB,
      unique: false,
    },
    foreignKey: 'page_id'
  });
  model.Page.hasMany(VariationFB);

  module.exports.VariationFB = VariationFB;
  module.exports.VariationTW = VariationTW;
}

module.exports = { _init: _init };
