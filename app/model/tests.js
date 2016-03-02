var Sequelize   = require('sequelize');

var _init = function(tblPrefix, sequelize) {
  var Site = sequelize.define('site',
    {
      host: {
        type: Sequelize.STRING
      },
      authorized: {
        type: Sequelize.BOOLEAN
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
      tableName: tblPrefix + 'site',
      classMethods: {
        getSiteFromURL: function(url, callback) {
          console.log('trol');
          callback(null, 'lol')
        }
      }
    }
  );

  var Page = sequelize.define('page',
    {
      path: {
        type: Sequelize.STRING
      },
      site_id: {
        type: Sequelize.BIGINT,
          references: {
          model: Site,
          key: "id"
        }
      },
      test_running: {
        type: Sequelize.BOOLEAN
      },
      test_started: {
        type: Sequelize.DATE
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
      tableName: tblPrefix + 'page'
    }
  );

  var VariationFB = sequelize.define('variation_fb',
    {
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
        type: Sequelize.INTEGER
      },
      clicks: {
        type: Sequelize.INTEGER
      },
      confidence: {
        type: Sequelize.FLOAT
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      default: {
        type: Sequelize.BOOLEAN
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
      tableName: tblPrefix + 'variation_fb'
    }
  );

  var VariationTW = sequelize.define('variation_tw',
    {
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
        type: Sequelize.INTEGER
      },
      clicks: {
        type: Sequelize.INTEGER
      },
      confidence: {
        type: Sequelize.FLOAT
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      default: {
        type: Sequelize.BOOLEAN
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
      tableName: tblPrefix + 'variation_tw'
    }
  );

  module.exports.Site = Site;
  module.exports.Page = Page;
  module.exports.VariationFB = VariationFB;
  module.exports.VariationTW = VariationTW;
}

module.exports = { _init: _init };
