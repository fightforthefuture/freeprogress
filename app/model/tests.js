var Sequelize   = require('sequelize');
var jsdom = require("node-jsdom");
var request = require('request').defaults({ encoding: null });
var imageType = require('image-type');
var sha1 = require('sha1');

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
        },

        saveBasicFields: _mixinSaveBasicFields,
        storeImg: _mixinStoreImg
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
        },

        saveBasicFields: _mixinSaveBasicFields,
        storeImg: _mixinStoreImg
      }
    }
  );

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

var _mixinSaveBasicFields = function(data, callback) {

  var query = {};

  var fields = [
    'site',
    'tweet_text',
    'site_name',
    'title',
    'description',
    'url',
    'image_url',
    'active',
    'default',
    'page_id',
    'id'
  ];
  for (var i = 0; i < fields.length; i++)
    if (typeof data[fields[i]] !== 'undefined')
      query[fields[i]] = data[fields[i]];

  if (query.id)
    this.update(
      query, { where: {id: query.id}, returning: true }
    ).then(function(data) {
      if (data.length != '2' || data[1].length != 1)
        return callback({ref: 'TESTS_VARIATION_UPDATE_ERROR'}, null);

      callback(null, data[1][0]);
    }.bind(this));
  else
    this.create(query).then(function(record) {
      callback(null, record);
    }.bind(this));
}

var _mixinStoreImg = function(instance, imgData, callback) {
  var buffer  = new Buffer(imgData, 'base64');
  var type    = imageType(buffer);

  if (!type || !type.ext)
    return callback({ref: 'TESTS_BAD_IMAGE_UPLOAD'}, null);

  var filename = instance.id+'-'+sha1(new Date().toISOString())+'.'+type.ext;
  var path = model._util.config.aws.s3_folder+'/'+filename;
  console.log('filename: ', path);

  var s3   = new  model._util.AWS.S3();

  params   = {
    Bucket: model._util.config.aws.s3_bucket,
    Key: path,
    ACL: 'public-read',
    Body: buffer,
    ContentType: type.mime
  }

  s3.upload(params, function(err, data) {
    if (err)
      return callback({ref: 'SERVER_S3_SAVE_FAIL', data: err}, null);

    instance.update({
      'image_url': '//' + model._util.config.aws.s3_bucket + '/' + path
    }).then(function() { callback(null, instance); });
  });
}

module.exports = { _init: _init };
