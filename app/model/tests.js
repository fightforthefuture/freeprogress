var Sequelize   = require('sequelize');
var jsdom = require("node-jsdom");
var request = require('request').defaults({ encoding: null });
var imageType = require('image-type');
var sha1 = require('sha1');
var jstat = require('../library/jstat');
var URL = require('url-parse');

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
      shortcode: {
        type: Sequelize.STRING,
        index: true
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        index: true,
        defaultValue: true
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
         *  Gets a random variation from one of the active ones
         */
        getRandomVariation: function(page, options, callback) {
          this.findAll({
            where: {
              page_id: page.id,
              active: true
            }
          }).then(function(variations) {

            var baseUrl   = model._util.config.url + '/f';

            if (options.emailRedirect)
              baseUrl += 'e';

            var diceRoll  = Math.floor((Math.random() * variations.length));

            callback({
              url: baseUrl + '/' + variations[diceRoll].shortcode
            });
          });
        },

        /**
         *  Gets a variation by shortcode
         */
        getByShortcode: function(shortcode, callback) {
          this.findOne({where: {shortcode: shortcode}}).then(function(result) {
            if (!result) return callback(null);
            result = result.toJSON();
            result._fp_url = model._util.config.url + '/f/' + result.shortcode;
            callback(result);
          });
        },

        createFromData: _mixinCreateFromData,
        saveBasicFields: _mixinSaveBasicFields,
        storeImg: _mixinStoreImg,
        significanceTest: _mixinSignificanceTest,
        generateShortcode: _mixinGenerateShortcode,
        logClick: _mixinLogClick,
        logShare: _mixinLogShare,
        findAndDeactivateLosers: _mixinFindAndDeactivateLosers,
        _deactivateLosers: _mixin_deactivateLosers
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
      shortcode: {
        type: Sequelize.STRING,
        index: true
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        index: true,
        defaultValue: true,
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
         *  Gets a random variation from one of the active ones
         */
        getRandomVariation: function(page, options, callback) {
          this.findAll({
            where: {
              page_id: page.id,
              active: true
            }
          }).then(function(variations) {

            var baseUrl   = model._util.config.url + '/t';

            if (options.emailRedirect)
              baseUrl += 'e';

            var diceRoll  = Math.floor((Math.random() * variations.length));

            callback({
              url: baseUrl + '/' + variations[diceRoll].shortcode,
              tweet_text: variations[diceRoll].tweet_text
            });
          });
        },

        /**
         *  Gets a variation by shortcode
         */
        getByShortcode: function(shortcode, callback) {
          this.findOne({where: {shortcode: shortcode}}).then(function(result) {
            if (!result) return callback(null);
            result = result.toJSON();
            try {
              result._fp_domain = new URL(result.url).host
            } catch(err) {
              console.log('Maybe you should use a real URL.');
            }
            callback(result);
          });
        },

        createFromData: _mixinCreateFromData,
        saveBasicFields: _mixinSaveBasicFields,
        storeImg: _mixinStoreImg,
        significanceTest: _mixinSignificanceTest,
        generateShortcode: _mixinGenerateShortcode,
        logClick: _mixinLogClick,
        logShare: _mixinLogShare,
        findAndDeactivateLosers: _mixinFindAndDeactivateLosers,
        _deactivateLosers: _mixin_deactivateLosers
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

  // STUPID ASS UPSERT
  if (query.id) {
    query.mod_date = Sequelize.fn('NOW');
    this.update(
      query, { where: {id: query.id}, returning: true }
    ).then(function(data) {
      if (data.length != '2' || data[1].length != 1)
        return callback({ref: 'TESTS_VARIATION_UPDATE_ERROR'}, null);

      callback(null, data[1][0]);
    }.bind(this));
  } else
    this.generateShortcode(function(shortcode) {
      query.shortcode = shortcode;
      this.create(query).then(function(record) {
        callback(null, record);
      }.bind(this));
    }.bind(this));
}

var _mixinGenerateShortcode = function(callback) {
  var candidate = sha1(new Date().toISOString()+Math.random()).substr(0, 6);
  this.findAll({where: {shortcode: candidate}}).then(function(models) {
    if (models.length) {
      console.log('SHORTCODE COLLISION OMG OMG:', candidate);
      return this.generateShortcode(callback);
    }
    callback(candidate);
  }.bind(this));
}

var _mixinStoreImg = function(instance, imgData, callback) {
  var buffer  = new Buffer(imgData, 'base64');
  var type    = imageType(buffer);

  if (!type || !type.ext)
    return callback({ref: 'TESTS_BAD_IMAGE_UPLOAD'}, null);

  var filename  = instance.id+'-'+sha1(new Date().toISOString())+'.'+type.ext;
  var path      = model._util.config.aws.s3_folder+'/'+filename;
  var s3        = new  model._util.AWS.S3();

  params = {
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
      image_url: 'https://' + model._util.config.aws.s3_bucket + '/' + path,
      mod_date: Sequelize.fn('NOW')
    }).then(function() { callback(null, instance); });
  });
}

/**
 *  Run a signficance test
 *
 *  @param n_A - number of clicks on page A
 *  @param X_A - number of shares on page A
 *  @param n_B - number of clicks on page B
 *  @param X_B - number of clicks on page B
 */
var _mixinSignificanceTest = function(n_A, X_A, n_B, X_B) {

  var piHat_A = X_A / n_A;                // proportion of successes in group A
  var piHat_B = X_B / n_B;                // proportion of successes in group B
  var piHat   = (X_A + X_B)/(n_A + n_B);  // average proportion of successes

  // JL NOTE ~ I put this absolute value thing in to prevent imaginary results.
  // Probably doesn't affect anything statistically. Maybe.
  // standard error formula
  var SE = Math.sqrt(Math.abs(piHat * (1 - piHat) * ((1/n_A)+(1/n_B)) ))

  /*
  console.log('n_A: ', n_A);
  console.log('X_A: ', X_A);
  console.log('n_B: ', n_B);
  console.log('X_B: ', X_B);
  console.log('piHat_A: ', piHat_A);
  console.log('piHat_B: ', piHat_B);
  console.log('piHat: ', piHat);
  console.log('(1 - piHat):', (1-piHat));
  console.log('((1/n_A)+(1/n_B)):', ((1/n_A)+(1/n_B)) );
  console.log('(1 - piHat) * ((1/n_A)+(1/n_B)):', (1 - piHat) * ((1/n_A)+(1/n_B)));
  console.log('piHat * (1 - piHat) * ((1/n_A)+(1/n_B)): ', piHat * (1 - piHat) * ((1/n_A)+(1/n_B)));
  console.log('SE: ', SE);
  */

  var z           = (piHat_A - piHat_B) / SE;
  var zSquared    = Math.pow(z, 2);
  var confidence  = 1 - (jstat.pnorm(Math.abs(z) * -1) * 2);

  return {
    ratioA: piHat_A,
    ratioB: piHat_B,
    z: z,
    winner: z <= 0 ? 'A': 'B',
    significant: confidence >= .95,
    confidence: confidence
  }
}

var _mixinFindAndDeactivateLosers = function(page) {
  console.log('deactivating losers...');
  this.findAll({
    where: {
      active: true,
      page_id: page.id
    }
  }).then(this._deactivateLosers);
}

var _mixinCreateFromData = function(variation, callback) {
  this.generateShortcode(function(shortcode) {
    variation.shortcode = shortcode;
    this.create(variation).then(function(variation) {
      callback(variation);
    });
  }.bind(this));
};

var _mixin_deactivateLosers = function(candidates) {

  if (candidates.length < 2) {
    console.log('No viable candidates to compare. We\'re done lol')
    return 'lol';
  }

  var foundSignificantResult = false;
  var baseline = candidates[0];

  console.log('Candidates: ', candidates.length);
  console.log('[BASELINE] shares:',baseline.shares,'; clicks:',baseline.clicks);

  for (var i = 1; i < candidates.length; i++) {
    var cand = candidates[i];

    console.log('---');
    console.log('[CAND '+i+'] shares:',cand.shares,'; clicks:',cand.clicks);

    // yeah, i know. this is theoretically inefficient. TODO FIX EVERYTHING.
    if (
      !baseline.clicks
      ||
      baseline.shares < model._util.config.test_viability_threshold
      ||
      !cand.clicks
      ||
      cand.shares < model._util.config.test_viability_threshold
    ) {
      console.log('Candidate or baseline below viability threshold. Skip lol');
      continue;
    }

    var abTest = this.significanceTest(
      baseline.clicks,
      baseline.shares,
      cand.clicks,
      cand.shares);
    console.log('test:', abTest);

    if (abTest.significant) {
      foundSignificantResult = true;
      console.log('SIGNIFICANT RESULT FOUND LOL');

      if (abTest.winner == 'A') {
        console.log('Baseline beat candidate. Deactivating candidate!');
        cand.update({
          active: false,
          mod_date: Sequelize.fn('NOW')
        });
      } else {
        console.log('Baseline is loser. Deactivating and bailing!');
        return baseline.update({
          active: false,
          mod_date: Sequelize.fn('NOW')
        });
      }
    }
  }
  if (foundSignificantResult == false) {
    console.log('NO SIGNIFICANT RESULT FOUND :(');
    console.log('Dumping baseline candidate and starting over lol...');
    console.log('---------------------------------------------------');
    console.log('---------------------------------------------------');
    console.log('---------------------------------------------------');
    candidates.shift();
    this._deactivateLosers(candidates);
  }
}

var _mixinLogClick = function(id) {
  this.update({clicks: Sequelize.literal('clicks +1')}, {where: {id: id}});
}

var _mixinLogShare = function(id) {
  this.update({shares: Sequelize.literal('shares +1')}, {where: {id: id}});
}

module.exports = { _init: _init };
